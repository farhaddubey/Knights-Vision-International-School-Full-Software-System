import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { removeSchoolMedia } from "@/src/lib/media/backblazeMedia";
import {
  assertEvidenceAdministrator,
  assertEvidenceScope,
  evidenceView,
  retentionDate,
  reviewNote,
} from "@/src/lib/media/schoolMediaEvidence";
import { PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

const evidenceInclude = {
  file: { select: { id: true, name: true, mime: true, size: true, key: true, folder_path: true } },
  school: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true, code: true } },
  submittedBy: { select: { id: true, username: true, email: true } },
  reviewedBy: { select: { id: true, username: true, email: true } },
};

function evidenceIdFrom(context) {
  const id = Number(context?.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new PanelAuthorizationError(400, "A valid evidence record id is required.");
  }
  return id;
}

function scopeFor(evidence) {
  return { schoolId: evidence.schoolId, branchId: evidence.branchId };
}

async function readScopedEvidence(id, authorization) {
  const evidence = await prisma.schoolMediaEvidence.findUnique({ where: { id }, include: evidenceInclude });
  if (!evidence) return null;
  assertEvidenceScope(authorization, evidence);
  return evidence;
}

export async function PATCH(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "evidence.verify");
    assertEvidenceAdministrator(authorization);
    const id = evidenceIdFrom(await context.params);
    const body = await request.json();
    const decision = String(body?.decision || "").trim().toUpperCase();
    if (decision !== "VERIFY" && decision !== "REJECT") {
      throw new PanelAuthorizationError(400, "Choose VERIFY or REJECT.");
    }
    const verificationNote = reviewNote(body?.verificationNote);
    const result = await prisma.$transaction(async (tx) => {
      const before = await tx.schoolMediaEvidence.findUnique({ where: { id }, include: evidenceInclude });
      if (!before) return null;
      assertEvidenceScope(authorization, before);
      await tx.$queryRaw`SELECT "id" FROM "SchoolMediaEvidence" WHERE "id" = ${id} FOR UPDATE`;
      const locked = await tx.schoolMediaEvidence.findUnique({ where: { id } });
      if (!locked) return null;
      if (locked.status !== "SUBMITTED") {
        if ((locked.status === "VERIFIED" && decision === "VERIFY") || (locked.status === "REJECTED" && decision === "REJECT")) {
          const existing = await tx.schoolMediaEvidence.findUnique({ where: { id }, include: evidenceInclude });
          return { before, evidence: existing, idempotent: true };
        }
        throw new PanelAuthorizationError(409, "This evidence has already received its final Administration decision.");
      }
      const reviewedAt = new Date();
      const evidence = await tx.schoolMediaEvidence.update({
        where: { id },
        data: {
          status: decision === "VERIFY" ? "VERIFIED" : "REJECTED",
          reviewedById: authorization.user.id,
          reviewedAt,
          verificationNote,
          deleteEligibleAt: retentionDate(reviewedAt),
        },
        include: evidenceInclude,
      });
      return { before, evidence, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Evidence record not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendEnterpriseAuditEvent({
        actorUserId: authorization.user.id,
        action: result.evidence.status === "VERIFIED" ? "school_media_evidence.verified" : "school_media_evidence.rejected",
        resource: "SchoolMediaEvidence",
        resourceId: result.evidence.id,
        scope: scopeFor(result.evidence),
        beforeData: { status: result.before.status },
        afterData: {
          status: result.evidence.status,
          verificationNote: result.evidence.verificationNote,
          deleteEligibleAt: result.evidence.deleteEligibleAt,
        },
      });
    }
    return NextResponse.json(evidenceView(result.evidence), { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[School evidence administration decision]", error);
    return NextResponse.json({ error: "Unable to decide this evidence record." }, { status: 500 });
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requireAdministrationPermission(request, "evidence.delete");
    assertEvidenceAdministrator(authorization);
    const id = evidenceIdFrom(await context.params);
    const evidence = await readScopedEvidence(id, authorization);
    if (!evidence) return NextResponse.json({ error: "Evidence record not found." }, { status: 404 });
    if (!evidence.deleteEligibleAt || new Date(evidence.deleteEligibleAt).getTime() > Date.now()) {
      throw new PanelAuthorizationError(409, "Evidence remains retained for 90 days after the final Administration decision.");
    }

    await removeSchoolMedia(evidence.file);
    await prisma.$transaction(async (tx) => {
      await tx.schoolMediaEvidence.delete({ where: { id } });
      await tx.files.delete({ where: { id: evidence.fileId } });
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "school_media_evidence.delete_after_retention",
      resource: "SchoolMediaEvidence",
      resourceId: id,
      scope: scopeFor(evidence),
      beforeData: { status: evidence.status, deleteEligibleAt: evidence.deleteEligibleAt, fileId: evidence.fileId },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[School evidence administration delete]", error);
    return NextResponse.json({ error: "Unable to delete this evidence record." }, { status: 500 });
  }
}
