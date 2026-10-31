import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { buildScopeWhere, hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';

export async function GET(req) {
  try {
    const authorization = await requirePanelPermission(req, 'branch.read');
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const branches = await prisma.schoolBranch.findMany({
      where: buildScopeWhere(authorization, { schoolId: 'schoolId', branchId: 'id' }),
      skip,
      take: pageSize,
      include: {
        school: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const totalBranches = await prisma.schoolBranch.count({
      where: buildScopeWhere(authorization, { schoolId: 'schoolId', branchId: 'id' }),
    });

    return NextResponse.json({
      branches,
      total: totalBranches,
      page,
      pageSize,
      totalPages: Math.ceil(totalBranches / pageSize),
    }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch branches" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authorization = await requirePanelPermission(req, 'branch.manage');

    const data = await req.json();
    const branches = Array.isArray(data) ? data : [data];

    if (!branches.every((branch) => hasScopeAccess(authorization, { schoolId: Number(branch.schoolId) }))) {
      return NextResponse.json({ error: 'You cannot create a branch outside your assigned school scope.' }, { status: 403 });
    }

    const createdBranches = await prisma.$transaction(
      branches.map((branch) =>
        prisma.schoolBranch.create({
          data: {
            schoolId: branch.schoolId,
            name: branch.name,
            code: branch.code,
            slug: branch.slug,
            address: branch.address,
            roomNumber: branch.roomNumber,
          },
        })
      )
    );

    return NextResponse.json(createdBranches, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: "Failed to create branch" }, { status: 500 });
  }
}
