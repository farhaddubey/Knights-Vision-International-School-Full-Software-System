import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { buildScopeWhere, isSystemAdministrator, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';


export async function GET(req) {
  try {
    const authorization = await requirePanelPermission(req, 'school.read');
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const schools = await prisma.school.findMany({
      where: buildScopeWhere(authorization, { schoolId: 'id' }),
      skip,
      take: pageSize,
      select: {
        id: true,
        name: true,
        city: true,
        address: true,
        type: true,
        logoUrl: true,
      },
      orderBy: { id: 'desc' },
    });

    const totalSchools = await prisma.school.count({ where: buildScopeWhere(authorization, { schoolId: 'id' }) });

    return NextResponse.json({
      schools,
      total: totalSchools,
      page,
      pageSize,
      totalPages: Math.ceil(totalSchools / pageSize),
    }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch schools" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const authorization = await requirePanelPermission(req, 'school.manage');
    if (!isSystemAdministrator(authorization)) {
      return NextResponse.json({ error: 'Only a System Administrator can create a new school.' }, { status: 403 });
    }
    const schools = await req.json();
    const createdSchools = await prisma.school.createMany({
      data: schools.map(school => ({
        name: school.name,
        city: school.city,
        address: school.address,
        type: school.type,
        logoUrl: school.logoUrl,
      })),
    });

    return NextResponse.json(createdSchools, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: "Failed to create schools" }, { status: 500 });
  }
}
