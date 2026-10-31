import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  authorizationErrorResponse,
  buildScopeWhere,
  isSystemAdministrator,
  requireAdministrationPermission,
} from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdministrationPermission(request, "rbac.read");
    const users = await prisma.user.findMany({
      where: isSystemAdministrator(authorization)
        ? {}
        : buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" }),
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        schoolId: true,
        branchId: true,
        is_active: true,
        blocked: true,
      },
      orderBy: [{ email: "asc" }],
      take: 500,
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
