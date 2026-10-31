import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { removeSchoolMedia, storeSchoolMedia } from "@/src/lib/media/backblazeMedia";
import {
  assertEvidenceScope,
  assertEvidenceSubmitter,
  evidenceDescription,
  evidenceReason,
  evidenceView,
} from "@/src/lib/media/schoolMediaEvidence";
import { PanelAuthorizationError, requireFacultyPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

const MAX_PAGE_SIZE = 30;

const evidenceInclude = {
  file: { select: { id: true, name: true, mime: true, size: true } },
  school: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true, code: true } },
  submittedBy: { select: { id: true, username: true, email: true } },
  reviewedBy: { select: { id: true, username: true, email: true } },
};

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value || ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function scopeFor(record) {
  return { schoolId: record.schoolId, branchId: record.branchId };
}

function routeError(error, fallback) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 401 });
  }
  console.error("[Faculty evidence]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

// A Principal sees only evidence they submitted. CEO/CTO use the separate
// Administration review screen; this prevents the Faculty Panel becoming an
// unscoped image archive.
export async function GET(request) {
  try {
    const authorization = await requireFacultyPermission(request, "evidence.read");
    assertEvidenceSubmitter(authorization);
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(positiveInteger(searchParams.get("pageSize"), 12), MAX_PAGE_SIZE);
    const status = String(searchParams.get("status") || "").trim().toUpperCase();
    const where = {
      submittedById: authorization.user.id,
      ...(status && ["SUBMITTED", "VERIFIED", "REJECTED"].includes(status) ? { status } : {}),
    };
    const [total, evidence] = await Promise.all([
      prisma.schoolMediaEvidence.count({ where }),
      prisma.schoolMediaEvidence.findMany({
        where,
        include: evidenceInclude,
        orderBy: { submittedAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({
      evidence: evidence.map(evidenceView),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    return routeError(error, "Unable to load submitted school evidence.");
  }
}

export async function POST(request) {
  let uploaded = null;
  try {
    const authorization = await requireFacultyPermission(request, "evidence.submit");
    assertEvidenceSubmitter(authorization);
    const formData = await request.formData();
    const schoolId = Number(formData.get("schoolId"));
    const branchId = Number(formData.get("branchId"));
    const reason = evidenceReason(formData.get("reason"));
    const description = evidenceDescription(formData.get("description"));
    const file = formData.get("file");

    if (!Number.isInteger(schoolId) || !Number.isInteger(branchId) || schoolId <= 0 || branchId <= 0) {
      throw new PanelAuthorizationError(400, "Select the school and branch for this evidence.");
    }
    const branch = await prisma.schoolBranch.findFirst({
      where: { id: branchId, schoolId },
      select: { id: true, schoolId: true, name: true },
    });
    if (!branch) throw new PanelAuthorizationError(400, "The selected branch does not belong to the selected school.");
    assertEvidenceScope(authorization, { schoolId, branchId });

    // Evidence never becomes public website media. The storage folder is
    // derived on the server; callers cannot invent arbitrary folder names.
    uploaded = await storeSchoolMedia({
      file,
      visibility: "private",
      folder: `evidence-s${schoolId}-b${branchId}-${reason.toLowerCase()}`,
    });

    const saved = await prisma.$transaction(async (tx) => {
      const createdFile = await tx.files.create({
        data: {
          name: uploaded.name,
          mime: uploaded.mime,
          size: uploaded.sizeKb,
          key: uploaded.key,
          url: "/api/faculty-evidence/pending/file",
          folder_path: uploaded.folderPath,
          created_by_id: authorization.user.id,
          updated_by_id: authorization.user.id,
        },
      });
      const evidence = await tx.schoolMediaEvidence.create({
        data: {
          fileId: createdFile.id,
          schoolId,
          branchId,
          reason,
          description,
          submittedById: authorization.user.id,
        },
        include: evidenceInclude,
      });
      await tx.files.update({
        where: { id: createdFile.id },
        data: { url: `/api/faculty-evidence/${evidence.id}/file` },
      });
      return evidence;
    });

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "school_media_evidence.submit",
      resource: "SchoolMediaEvidence",
      resourceId: saved.id,
      scope: scopeFor(saved),
      afterData: { reason, status: saved.status, fileId: saved.fileId, description },
    });
    return NextResponse.json(evidenceView(saved), { status: 201 });
  } catch (error) {
    if (uploaded?.key) {
      try {
        await removeSchoolMedia({ key: uploaded.key, folder_path: uploaded.folderPath });
      } catch (cleanupError) {
        console.error("[Faculty evidence cleanup]", cleanupError);
      }
    }
    return routeError(error, "Unable to submit school evidence.");
  }
}
