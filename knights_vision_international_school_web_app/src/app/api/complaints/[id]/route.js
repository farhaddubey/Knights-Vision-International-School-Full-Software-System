import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  assertScope,
  operationsError,
  requireConcernManage,
  routeId,
  schoolConcernInclude,
  schoolConcernUpdateData,
} from "@/src/lib/operations/scopedOperations";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";

export async function PUT(request, { params }) {
  try {
    const authorization = await requireConcernManage(request);
    const { id } = await params;
    const concernId = routeId(id, "Concern ID");
    const current = await prisma.schoolConcern.findUnique({ where: { id: concernId } });
    if (!current) return NextResponse.json({ error: "School concern not found." }, { status: 404 });
    assertScope(authorization, current);
    const data = schoolConcernUpdateData(await request.json(), authorization, current);
    const concern = await prisma.schoolConcern.update({
      where: { id: concernId },
      data,
      include: schoolConcernInclude,
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "school_concern.update",
      resource: "SchoolConcern",
      resourceId: concern.id,
      scope: { scopeType: "CLASS", schoolId: concern.schoolId, branchId: concern.branchId, classId: concern.classId },
      beforeData: { status: current.status, resolution: current.resolution },
      afterData: { status: concern.status, resolution: concern.resolution },
    });
    return NextResponse.json(concern);
  } catch (error) {
    return operationsError(error, "Failed to update school concern.");
  }
}

export async function DELETE() {
  return NextResponse.json({ error: "School concerns cannot be deleted; resolve or close them instead." }, { status: 405 });
}
