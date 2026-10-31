import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildScopeWhere, requirePanelPermission } from "@/src/lib/rbac/authorization";

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

/**
 * Legacy-compatible endpoint for the old employee list. It intentionally
 * returns a minimal staff directory: never Aadhaar, biometric, contact,
 * password, salary, or recovery-token fields.
 */
export async function GET(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, "staff.read");
    const url = new URL(req.url);
    const page = positiveInteger(url.searchParams.get("page"), 1, 100000);
    const pageSize = positiveInteger(url.searchParams.get("pageSize"), 20, 100);
    const where = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ username: "asc" }, { id: "asc" }],
        select: {
          id: true,
          img_url: true,
          username: true,
          email: true,
          is_active: true,
          blocked: true,
          created_at: true,
          updated_at: true,
          role: true,
          role_teacher: true,
          department: true,
          confirmed: true,
          branchId: true,
          schoolId: true,
          school: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({ users, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Manage users list]", error);
    return NextResponse.json({ error: "Unable to load staff records." }, { status: 500 });
  }
}
