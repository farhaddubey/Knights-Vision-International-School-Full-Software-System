import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { assertCollectionOfficer, UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } from "@/src/lib/finance/provisionalCollections";

function configuredAdmissionFee(admission) {
  return admission.admissionType === "READMISSION"
    ? admission.feeScheme?.readmissionFee ?? 0
    : admission.feeScheme?.admissionFee ?? 0;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const scopedWhere = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const admissions = await prisma.admission.findMany({
      where: { ...scopedWhere, status: { in: ["PENDING", "SELECTED"] }, feeSchemeId: { not: null } },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
        feeScheme: { select: { admissionFee: true, readmissionFee: true } },
        AdmissionFeeTransaction: { select: { amount: true } },
        provisionalCollections: { where: { status: { in: UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } }, select: { amount: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 300,
    });
    const eligibleAdmissions = admissions.map((admission) => {
      const configuredFee = configuredAdmissionFee(admission);
      const paidAmount = admission.AdmissionFeeTransaction.reduce((sum, transaction) => sum + transaction.amount, 0);
      const pendingAmount = admission.provisionalCollections.reduce((sum, collection) => sum + collection.amount, 0);
      return {
        id: admission.id,
        admissionType: admission.admissionType,
        finalAdmissionNumber: admission.finalAdmissionNumber,
        student: admission.student,
        configuredFee,
        paidAmount,
        pendingAmount,
        outstandingAmount: Math.max(0, configuredFee - paidAmount - pendingAmount),
      };
    }).filter((admission) => admission.outstandingAmount > 0.00001);
    return NextResponse.json({ eligibleAdmissions });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Admission fee eligibility]", error);
    return NextResponse.json({ error: "Unable to load admission fee records." }, { status: 500 });
  }
}
