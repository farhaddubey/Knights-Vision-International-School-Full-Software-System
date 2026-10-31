import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { assertCollectionOfficer, feeOutstanding, UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } from "@/src/lib/finance/provisionalCollections";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const { searchParams } = new URL(request.url);
    const search = String(searchParams.get("search") || "").trim();
    const scopedWhere = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const fees = await prisma.monthlyFee.findMany({
      where: {
        ...scopedWhere,
        status: { in: ["UNPAID", "PARTIALLY_PAID"] },
        ...(search ? {
          student: {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { middleName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { admissionNumber: { contains: search, mode: "insensitive" } },
            ],
          },
        } : {}),
      },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
        provisionalCollections: { where: { status: { in: UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } }, select: { amount: true } },
      },
      orderBy: [{ year: "asc" }, { month: "asc" }, { id: "asc" }],
      take: 100,
    });
    const eligibleFees = fees
      .map((fee) => {
        const pendingAmount = fee.provisionalCollections.reduce((sum, entry) => sum + entry.amount, 0);
        return {
          id: fee.id,
          month: fee.month,
          year: fee.year,
          student: fee.student,
          outstandingAmount: Math.max(0, feeOutstanding(fee) - pendingAmount),
          pendingAmount,
        };
      })
      .filter((fee) => fee.outstandingAmount > 0.00001);
    return NextResponse.json({ eligibleFees });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Provisional fee collection eligible fees]", error);
    return NextResponse.json({ error: "Unable to load eligible fee records." }, { status: 500 });
  }
}
