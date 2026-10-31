import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { createTcRequest, lifecycleErrorResponse, requireLifecyclePermission } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

// A legacy endpoint used to issue a TC immediately and without authorisation.
// It is retained only as a safe request adapter; Principal and COEF decisions
// are now mandatory before an official document can be generated.
export async function POST(request) {
  try {
    const authorization = await requireLifecyclePermission(request, "TC_REQUEST_CREATE", "student.read");
    const body = await request.json();
    const result = await createTcRequest(authorization, {
      ...body,
      requestedTransferDate: body.requestedTransferDate || body.dateOfLeaving,
      staffRemarks: body.staffRemarks || body.remarks,
      guardianRemarks: body.guardianRemarks || null,
      reason: body.reason || "OTHER",
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.legacy_tc_request_adapter",
      resource: "TransferCertificateRequest",
      resourceId: result.request.publicId,
      scope: result.scope,
      afterData: { studentId: result.student.id, status: result.request.status },
    });
    return NextResponse.json({
      transferCertificateId: result.request.publicId,
      request: result.request,
      message: "TC request submitted for Principal and COEF review. An official TC has not been issued yet.",
    }, { status: 202 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to submit the transfer-certificate request.");
  }
}
