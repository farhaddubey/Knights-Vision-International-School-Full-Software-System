import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { assertGlobalConfigurationScope, schoolConfigurationWhere } from "@/src/lib/rbac/configurationScope";

function positivePage(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "school.read");
    const query = new URL(request.url).searchParams;
    const page = positivePage(query.get("page"), 1);
    const pageSize = Math.min(positivePage(query.get("pageSize"), 10), 100);
    const where = await schoolConfigurationWhere(authorization);
    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: { id: true, name: true, city: true, address: true, type: true, logoUrl: true },
        orderBy: { id: "desc" },
      }),
      prisma.school.count({ where }),
    ]);
    return NextResponse.json({ schools, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "school.manage");
    assertGlobalConfigurationScope(authorization);
    const payload = await request.json();
    const schools = Array.isArray(payload) ? payload : [payload];
    if (!schools.length || schools.some((school) => !school?.name || !school?.address || !school?.type)) {
      return NextResponse.json({ error: "Each institution needs a name, address, and type." }, { status: 400 });
    }
    const createdSchools = await prisma.school.createMany({
      data: schools.map((school) => ({
        name: String(school.name).trim(), city: school.city || null, address: String(school.address).trim(), type: school.type, logoUrl: school.logoUrl || null,
      })),
    });
    return NextResponse.json(createdSchools, { status: 201 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

