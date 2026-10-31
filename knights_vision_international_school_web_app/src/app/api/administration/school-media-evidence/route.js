import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { assertEvidenceAdministrator, evidenceView } from "@/src/lib/media/schoolMediaEvidence";
import { PanelAuthorizationError, buildScopeWhere, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

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

export async function GET(request) {
  try {
    const authorization = await requireAdministrationPermission(request, "evidence.read");
    assertEvidenceAdministrator(authorization);
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(positiveInteger(searchParams.get("pageSize"), 18), 60);
    const status = String(searchParams.get("status") || "").trim().toUpperCase();
    const schoolId = positiveInteger(searchParams.get("schoolId"), 0);
    const branchId = positiveInteger(searchParams.get("branchId"), 0);
    const scopedWhere = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const where = {
      ...scopedWhere,
      ...(status && ["SUBMITTED", "VERIFIED", "REJECTED"].includes(status) ? { status } : {}),
      ...(schoolId ? { schoolId } : {}),
      ...(branchId ? { branchId } : {}),
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
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[School evidence administration list]", error);
    return NextResponse.json({ error: "Unable to load submitted school evidence." }, { status: 500 });
  }
}
