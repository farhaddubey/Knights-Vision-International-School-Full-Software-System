import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, requireAdministrationPermission } from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    await requireAdministrationPermission(request, "rbac.read");
    const permissions = await prisma.accessPermission.findMany({
      orderBy: [{ category: "asc" }, { code: "asc" }],
    });
    return NextResponse.json({ success: true, data: permissions });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
