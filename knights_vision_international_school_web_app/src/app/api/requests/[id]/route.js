import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  assertScope,
  operationalRequestInclude,
  operationalRequestWriteData,
  operationsError,
  requireOperationsManage,
  routeId,
} from "@/src/lib/operations/scopedOperations";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";

export async function PUT(request, { params }) {
  try {
    const authorization = await requireOperationsManage(request);
    const { id } = await params;
    const recordId = routeId(id, "Request ID");
    const current = await prisma.operationalRequest.findUnique({ where: { id: recordId } });
    if (!current) return NextResponse.json({ error: "Operational request not found." }, { status: 404 });
    assertScope(authorization, current);
    const data = await operationalRequestWriteData(await request.json(), authorization, { existing: current });
    const record = await prisma.operationalRequest.update({
      where: { id: recordId },
      data,
      include: operationalRequestInclude,
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "operational_request.update",
      resource: "OperationalRequest",
      resourceId: record.id,
      scope: { scopeType: "BRANCH", schoolId: record.schoolId, branchId: record.branchId, classId: null },
      beforeData: { status: current.status, assignedToId: current.assignedToId, priority: current.priority },
      afterData: { status: record.status, assignedToId: record.assignedToId, priority: record.priority },
    });
    return NextResponse.json(record);
  } catch (error) {
    return operationsError(error, "Failed to update operational request.");
  }
}

// Operational requests are retained for audit. Cancel them through PUT with
// status=CANCELLED rather than deleting their approval history.
export async function DELETE() {
  return NextResponse.json({ error: "Operational requests cannot be deleted; cancel them instead." }, { status: 405 });
}
