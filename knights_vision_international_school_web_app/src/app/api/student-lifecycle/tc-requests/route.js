import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { createTcRequest, financialSnapshot, lifecycleErrorResponse, requireLifecyclePermission } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { searchParams } = new URL(request.url);
    const status = String(searchParams.get("status") || "").trim().toUpperCase();
    const scopedWhere = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const requests = await prisma.transferCertificateRequest.findMany({
      where: { ...scopedWhere, ...(status ? { status } : {}) },
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        student: { select: { id: true, admissionNumber: true, firstName: true, middleName: true, lastName: true, guardianName: true, guardianContact: true } },
        requestedBy: { select: { id: true, username: true, email: true } },
        principalDecisionBy: { select: { id: true, username: true, email: true } },
        financeVerifiedBy: { select: { id: true, username: true, email: true } },
        issuedBy: { select: { id: true, username: true, email: true } },
      },
    });
    const canViewSensitive = authorization.permissions.includes("TC_PRINCIPAL_APPROVE") || authorization.permissions.includes("TC_FINANCE_VERIFY");
    const canReviewFinance = authorization.permissions.includes("TC_FINANCE_VERIFY");
    // A COEF receives a fresh view before deciding. The persisted snapshot is
    // still written at the decision itself as the auditable decision record.
    const financeReviews = canReviewFinance
      ? new Map(await Promise.all(
        requests
          .filter((entry) => entry.status === "PRINCIPAL_APPROVED")
          .map(async (entry) => [entry.id, await financialSnapshot(entry.studentId, entry.academicYear)]),
      ))
      : new Map();
    return NextResponse.json({
      requests: requests.map((entry) => {
        const visibleEntry = canViewSensitive ? entry : { ...entry, sensitiveDetails: undefined };
        return financeReviews.has(entry.id)
          ? { ...visibleEntry, financeReview: financeReviews.get(entry.id) }
          : visibleEntry;
      }),
    });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to load transfer-certificate requests.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requireLifecyclePermission(request, "TC_REQUEST_CREATE", "student.read");
    const result = await createTcRequest(authorization, await request.json());
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "student_lifecycle.tc.requested",
      resource: "TransferCertificateRequest",
      resourceId: result.request.publicId,
      scope: result.scope,
      afterData: { studentId: result.student.id, reason: result.request.reason, requestedTransferDate: result.request.requestedTransferDate },
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to create the transfer-certificate request.");
  }
}
