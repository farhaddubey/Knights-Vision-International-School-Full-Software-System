import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { hasPermission } from "@/src/lib/rbac/authorization";
import { lifecycleErrorResponse, requireLifecyclePermission, tcRequestById, text, TRANSFER_REASONS } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function POST(request, context) {
  try {
    const authorization = await requireLifecyclePermission(request, "TC_REQUEST_CREATE", "student.read");
    const { id } = await context.params;
    const tcRequest = await tcRequestById(id, authorization);
    const body = await request.json();
    const category = String(body?.category || tcRequest.reason).trim().toUpperCase();
    if (!TRANSFER_REASONS.has(category)) return NextResponse.json({ error: "A valid feedback category is required." }, { status: 400 });
    const isSensitive = body?.isSensitive === true;
    if (isSensitive && !hasPermission(authorization, "TC_PRINCIPAL_APPROVE") && !hasPermission(authorization, "TC_FINANCE_VERIFY")) {
      return NextResponse.json({ error: "Only authorised reviewers can store restricted TC feedback." }, { status: 403 });
    }
    const feedback = await prisma.transferCertificateFeedback.create({
      data: {
        requestId: tcRequest.id,
        category,
        explanation: text(body?.explanation, "explanation", { required: true, max: 5_000 }),
        isSensitive,
        recordedById: authorization.user.id,
      },
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.tc.guardian_feedback_recorded",
      resource: "TransferCertificateFeedback",
      resourceId: feedback.id,
      scope: { scopeType: "CLASS", schoolId: tcRequest.schoolId, branchId: tcRequest.branchId, classId: tcRequest.classId },
      afterData: { requestId: tcRequest.publicId, category, isSensitive },
    });
    return NextResponse.json({ feedback }, { status: 201 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to record guardian feedback.");
  }
}
