import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { SCHOOL_EVIDENCE_REASONS, assertEvidenceSubmitter } from "@/src/lib/media/schoolMediaEvidence";
import { PanelAuthorizationError, buildScopeWhere, requireFacultyPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authorization = await requireFacultyPermission(request, "evidence.submit");
    assertEvidenceSubmitter(authorization);
    const scope = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "id" });
    const branches = await prisma.schoolBranch.findMany({
      where: scope,
      select: {
        id: true,
        schoolId: true,
        name: true,
        code: true,
        school: { select: { id: true, name: true } },
      },
      orderBy: [{ school: { name: "asc" } }, { name: "asc" }],
    });
    return NextResponse.json({
      branches: branches.map((branch) => ({
        id: branch.id,
        name: branch.name,
        code: branch.code,
        school: branch.school,
      })),
      reasons: Object.entries(SCHOOL_EVIDENCE_REASONS).map(([code, label]) => ({ code, label })),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Faculty evidence options]", error);
    return NextResponse.json({ error: "Unable to load authorised school and branch choices." }, { status: 500 });
  }
}
