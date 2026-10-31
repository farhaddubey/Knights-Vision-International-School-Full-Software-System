import { NextResponse } from "next/server";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { createReadmission, lifecycleErrorResponse, requireLifecyclePermission } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

// Legacy compatibility adapter.  It intentionally no longer creates a paid
// fee transaction or monthly-fee rows: all future readmissions use the single
// provisional custody workflow and the StudentEnrollment history table.
export async function POST(request) {
  try {
    const authorization = await requireLifecyclePermission(request, "STUDENT_READMISSION_CREATE", "admission.manage");
    const result = await createReadmission(authorization, await request.json());
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.legacy_readmission_adapter",
      resource: "StudentEnrollment",
      resourceId: result.enrollment.publicId,
      scope: result.scope,
      afterData: { studentId: result.student.id, admissionId: result.admission.id, collectionId: result.collection?.publicId || null },
    });
    return NextResponse.json({
      admission: result.admission,
      enrollment: result.enrollment,
      collection: result.collection,
      admissionFeeTransaction: null,
      monthlyFees: [],
      message: "Readmission is prepared. Any collected money is provisional until the existing custody verification workflow completes.",
    }, { status: 201 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to prepare the annual readmission.");
  }
}
