import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import {
  FEE_CATEGORIES,
  financeErrorResponse,
  scopedSchoolClass,
} from "@/src/lib/finance/scopedFees";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get("classId");
    const schoolClass = await scopedSchoolClass(authorization, classId, "You cannot view fee schemes outside your assigned scope.");
    const requestedCategory = searchParams.get("category");
    const category = requestedCategory == null || requestedCategory === "" ? undefined : requestedCategory.trim().toUpperCase();
    if (category && !FEE_CATEGORIES.has(category)) {
      return NextResponse.json({ error: "category is invalid." }, { status: 400 });
    }
    const feeSchemes = await prisma.feeScheme.findMany({
      where: { classId: schoolClass.id, category },
      orderBy: { category: "asc" },
    });
    return NextResponse.json({ feeSchemes });
  } catch (error) {
    const response = financeErrorResponse(error, "Failed to fetch fee schemes.");
    return NextResponse.json(response.body, { status: response.status });
  }
}
