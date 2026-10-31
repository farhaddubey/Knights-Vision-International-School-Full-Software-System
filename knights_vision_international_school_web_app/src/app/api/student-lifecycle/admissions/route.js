import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { createAdmission, lifecycleErrorResponse, requireLifecyclePermission } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    // GCI, COEF and Principal need the explicit lifecycle grant plus scoped
    // student visibility. The legacy broad admissions-management fallback
    // would silently block an authorised GCI user.
    const authorization = await requireLifecyclePermission(request, "STUDENT_ADMISSION_CREATE", "student.read");
    const result = await createAdmission(authorization, await request.json());
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.admission.created",
      resource: "StudentEnrollment",
      resourceId: result.enrollment.publicId,
      scope: result.scope,
      afterData: {
        studentId: result.student.id,
        admissionNumber: result.student.admissionNumber,
        admissionId: result.admission.id,
        collectionId: result.collection?.publicId || null,
        configuredFee: result.configuredFee,
      },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to create the student admission.");
  }
}
