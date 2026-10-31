import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { hasPermission, PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { schoolConfigurationWhere } from "@/src/lib/rbac/configurationScope";

export const dynamic = "force-dynamic";

const pendingPolicyStatuses = ["SUBMITTED", "UNDER_REVIEW"];
const openOperationalStatuses = ["PENDING", "IN_PROGRESS", "ON_HOLD"];

function scopedWhere(authorization, fields) {
  return buildScopedWhere(authorization.scopes, fields);
}

function financeSummary(result) {
  return {
    count: result._count,
    amount: result._sum.amount || 0,
  };
}

export async function GET(request) {
  try {
    const authorization = await requireAdministrationPermission(request, "dashboard.read");
    const schoolWhere = await schoolConfigurationWhere(authorization);
    const branchWhere = scopedWhere(authorization, { schoolId: "schoolId", branchId: "id" });
    const classWhere = scopedWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "id" });
    const recordWhere = scopedWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const userWhere = scopedWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const canReadFinance = hasPermission(authorization, "fee.read");
    const canReadStaff = hasPermission(authorization, "staff.read");

    const [schools, branches, classes, students, staffAccounts, pendingPolicies, openOperations, monthlySettlement, admissionSettlement] = await Promise.all([
      prisma.school.count({ where: schoolWhere }),
      prisma.schoolBranch.count({ where: branchWhere }),
      prisma.schoolClass.count({ where: classWhere }),
      prisma.student.count({ where: recordWhere }),
      canReadStaff ? prisma.user.count({ where: userWhere }) : Promise.resolve(null),
      prisma.policyException.count({ where: { ...recordWhere, status: { in: pendingPolicyStatuses } } }),
      prisma.operationalRequest.count({ where: { ...recordWhere, status: { in: openOperationalStatuses } } }),
      canReadFinance ? prisma.provisionalFeeCollection.aggregate({
        where: { ...recordWhere, status: "BANK_SUBMITTED", paymentKind: "MONTHLY_TUITION" },
        _count: true,
        _sum: { amount: true },
      }) : Promise.resolve(null),
      canReadFinance ? prisma.provisionalFeeCollection.aggregate({
        where: { ...recordWhere, status: "BANK_SUBMITTED", paymentKind: { in: ["NEW_ADMISSION", "READMISSION"] } },
        _count: true,
        _sum: { amount: true },
      }) : Promise.resolve(null),
    ]);

    return NextResponse.json({
      institution: { schools, branches, classes, students, staffAccounts },
      approvals: { pendingPolicies, openOperations },
      finance: canReadFinance
        ? { monthlyBankSubmitted: financeSummary(monthlySettlement), admissionBankSubmitted: financeSummary(admissionSettlement) }
        : null,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Administration command center]", error);
    return NextResponse.json({ error: "Unable to load Central Administration summary." }, { status: 500 });
  }
}
