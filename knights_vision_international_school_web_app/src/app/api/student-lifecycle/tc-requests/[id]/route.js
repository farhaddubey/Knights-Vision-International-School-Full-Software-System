import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { lifecycleErrorResponse, tcRequestById, transitionTcRequest } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { id } = await context.params;
    const requestRecord = await tcRequestById(id, authorization);
    const canViewSensitive = authorization.permissions.includes("TC_PRINCIPAL_APPROVE") || authorization.permissions.includes("TC_FINANCE_VERIFY");
    return NextResponse.json({
      request: canViewSensitive
        ? requestRecord
        : { ...requestRecord, sensitiveDetails: undefined, feedback: requestRecord.feedback.filter((item) => !item.isSensitive) },
    });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to load the transfer-certificate request.");
  }
}

export async function PATCH(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { id } = await context.params;
    const body = await request.json();
    const result = await transitionTcRequest(id, authorization, body);
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: `student_lifecycle.tc.${String(body?.action || "updated").toLowerCase()}`,
      resource: "TransferCertificateRequest",
      resourceId: result.updated.publicId,
      scope: result.scope,
      beforeData: { status: result.request.status },
      afterData: { status: result.updated.status, tcNumber: result.updated.tcNumber || null, governmentTcId: result.updated.governmentTcId || null },
    });
    return NextResponse.json({ request: result.updated });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to update the transfer-certificate workflow.");
  }
}
