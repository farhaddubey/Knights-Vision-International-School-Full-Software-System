import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  authorizationErrorResponse,
  buildScopeWhere,
  requireFacultyPermission,
} from "@/src/lib/rbac/authorization";

// This is a published catalogue, not the fee-management API.  Every Faculty
// role may view the two school-approved admission schemes in its own scope,
// while fee creation, overrides, collections, and verification remain behind
// their dedicated finance permissions.
const VISIBLE_CATEGORIES = ["KSAT_GENERAL", "DIRECT_GENERAL"];

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authorization = await requireFacultyPermission(request, "panel.access");
    const classScope = buildScopeWhere(authorization, {
      schoolId: "schoolId",
      branchId: "branchId",
      classId: "id",
    });

    const feeSchemes = await prisma.feeScheme.findMany({
      where: {
        category: { in: VISIBLE_CATEGORIES },
        class: { is: classScope },
      },
      select: {
        id: true,
        category: true,
        monthlyFee: true,
        admissionFee: true,
        readmissionFee: true,
        createdAt: true,
        updatedAt: true,
        class: { select: { id: true, name: true, section: true } },
      },
      orderBy: [{ classId: "asc" }, { category: "asc" }],
    });

    return NextResponse.json({ feeSchemes });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
