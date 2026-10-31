import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { createReadmission, lifecycleErrorResponse, requireLifecyclePermission } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const authorization = await requireLifecyclePermission(request, "STUDENT_READMISSION_CREATE", "admission.manage");
    const result = await createReadmission(authorization, await request.json());
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.readmission.prepared",
      resource: "StudentEnrollment",
      resourceId: result.enrollment.publicId,
      scope: result.scope,
      afterData: {
        studentId: result.student.id,
        admissionId: result.admission.id,
        decision: result.enrollment.decision,
        collectionId: result.collection?.publicId || null,
        configuredFee: result.configuredFee,
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to prepare the annual readmission.");
  }
}
