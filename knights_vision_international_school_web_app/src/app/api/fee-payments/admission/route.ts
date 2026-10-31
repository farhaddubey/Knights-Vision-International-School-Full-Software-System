import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  combineWhere,
  errorResponse,
  pagination,
  requireAdditionalPermission,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";

export { POST } from "@/src/app/api/admission-fee-transactions/route";

export async function GET(request: Request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    requireAdditionalPermission(authorization, "admission.read", "Admission-fee history requires admission-read permission.");
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), { academicYear });
    const [fees, total] = await Promise.all([
      prisma.admissionFeeTransaction.findMany({
        where,
        skip,
        take: pageSize,
        include: { student: { select: { firstName: true, lastName: true } } },
        orderBy: { paymentDate: "desc" },
      }),
      prisma.admissionFeeTransaction.count({ where }),
    ]);
    return NextResponse.json({
      fees: fees.map((fee) => ({ ...fee, status: fee.paymentDate ? "PAID" : "UNPAID" })),
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      currentPage: page,
      total,
    });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission fee history.");
  }
}
