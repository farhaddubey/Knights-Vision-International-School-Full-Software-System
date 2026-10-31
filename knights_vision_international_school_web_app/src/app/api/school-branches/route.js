import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, buildScopeWhere, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

function positivePage(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "branch.read");
    const query = new URL(request.url).searchParams;
    const page = positivePage(query.get("page"), 1);
    const pageSize = Math.min(positivePage(query.get("pageSize"), 10), 100);
    const where = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "id" });
    const [branches, total] = await Promise.all([
      prisma.schoolBranch.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { school: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.schoolBranch.count({ where }),
    ]);
    return NextResponse.json({ branches, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "branch.manage");
    const payload = await request.json();
    const branches = Array.isArray(payload) ? payload : [payload];
    if (!branches.length) return NextResponse.json({ error: "At least one branch is required." }, { status: 400 });
    for (const branch of branches) {
      const schoolId = Number(branch?.schoolId);
      if (!Number.isInteger(schoolId) || schoolId <= 0 || !branch?.name || !branch?.code || !branch?.slug) {
        return NextResponse.json({ error: "Each branch needs a valid school, name, code, and slug." }, { status: 400 });
      }
      if (!hasScopeAccess(authorization, { schoolId })) {
        return NextResponse.json({ error: "A branch may only be created in an assigned institution." }, { status: 403 });
      }
    }
    const createdBranches = await prisma.$transaction(branches.map((branch) => prisma.schoolBranch.create({
      data: {
        schoolId: Number(branch.schoolId), name: String(branch.name).trim(), code: String(branch.code).trim(), slug: String(branch.slug).trim(), address: branch.address || null, roomNumber: branch.roomNumber || null,
      },
    })));
    return NextResponse.json(createdBranches, { status: 201 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}
