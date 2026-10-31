import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import {
  lifecycleErrorResponse,
  markStudentLeft,
  studentByIdWithScope,
  updateStudentProfile,
} from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { id } = await context.params;
    const student = await studentByIdWithScope(id, authorization);
    const canViewSensitiveTcFeedback = authorization.permissions.includes("TC_PRINCIPAL_APPROVE") || authorization.permissions.includes("TC_FINANCE_VERIFY");
    if (!canViewSensitiveTcFeedback) {
      student.transferCertificateRequests = student.transferCertificateRequests.map((entry) => ({
        ...entry,
        sensitiveDetails: undefined,
        feedback: entry.feedback.filter((item) => !item.isSensitive),
      }));
    }
    return NextResponse.json({ student });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to load student history.");
  }
}

export async function PATCH(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.manage");
    const { id } = await context.params;
    const body = await request.json();
    const result = body?.action === "MARK_LEFT"
      ? await markStudentLeft(id, authorization, body)
      : await updateStudentProfile(id, authorization, body);
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: body?.action === "MARK_LEFT" ? "student_lifecycle.student.marked_left" : "student_lifecycle.student.profile_updated",
      resource: "Student",
      resourceId: result.updated.id,
      scope: result.scope,
      beforeData: { status: result.student.status },
      afterData: { status: result.updated.status },
    });
    return NextResponse.json({ student: result.updated });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to update the student record.");
  }
}
