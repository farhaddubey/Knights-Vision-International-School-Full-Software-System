import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildScopeWhere, requirePanelPermission } from "@/src/lib/rbac/authorization";

function pageValue(value, fallback, maximum = 100) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

function workforceWhere(authorization) {
  const scope = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
  return {
    AND: [
      scope,
      // Modern student/guardian accounts use RBAC roles, while older staff
      // accounts use the legacy enum. Include either staff shape, but never a
      // pure STUDENT/GUARDIAN RBAC account in the HR directory.
      {
        OR: [
          { role: { not: null } },
          {
            accessRoleAssignments: {
              some: {
                isActive: true,
                role: { code: { notIn: ["STUDENT", "GUARDIAN"] } },
              },
            },
          },
        ],
      },
    ],
  };
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "staff.read");
    const { searchParams } = new URL(request.url);
    const page = pageValue(searchParams.get("page"), 1, 100000);
    const pageSize = pageValue(searchParams.get("pageSize"), 25, 100);
    const search = String(searchParams.get("search") || "").trim();
    const baseWhere = workforceWhere(authorization);
    const where = search
      ? {
        AND: [
          baseWhere,
          {
            OR: [
              { username: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
              { accessRoleAssignments: { some: { isActive: true, role: { code: { contains: search, mode: "insensitive" } } } } },
            ],
          },
        ],
      }
      : baseWhere;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: [{ username: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          img_url: true,
          username: true,
          email: true,
          role: true,
          department: true,
          is_active: true,
          blocked: true,
          schoolId: true,
          branchId: true,
          school: { select: { id: true, name: true } },
          branch: { select: { id: true, name: true, code: true } },
          accessRoleAssignments: {
            where: { isActive: true },
            select: { role: { select: { code: true, name: true } } },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({
      data: users.map((user) => ({
        ...user,
        roles: user.accessRoleAssignments.map((assignment) => assignment.role),
        accessRoleAssignments: undefined,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    });
  } catch (error) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Administration workforce]", error);
    return NextResponse.json({ error: "Unable to load the workforce directory." }, { status: 500 });
  }
}
