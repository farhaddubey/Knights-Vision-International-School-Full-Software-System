import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, buildScopeWhere, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

function pageValue(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "class.read");
    const query = new URL(request.url).searchParams;
    const page = pageValue(query.get("page"), 1);
    const pageSize = Math.min(pageValue(query.get("pageSize"), 10), 100);
    const requestedSchoolId = Number(query.get("schoolId")) || null;
    const requestedBranchId = Number(query.get("branchId")) || null;
    const scopeWhere = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const where = { AND: [scopeWhere, ...(requestedSchoolId ? [{ schoolId: requestedSchoolId }] : []), ...(requestedBranchId ? [{ branchId: requestedBranchId }] : [])] };
    const [rooms, total] = await Promise.all([
      prisma.room.findMany({ where, skip: (page - 1) * pageSize, take: pageSize, include: { branch: { select: { id: true, name: true, school: { select: { name: true } } } } }, orderBy: { createdAt: "desc" } }),
      prisma.room.count({ where }),
    ]);
    return NextResponse.json({ rooms, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "class.manage");
    const payload = await request.json();
    const rooms = Array.isArray(payload) ? payload : [payload];
    if (!rooms.length) return NextResponse.json({ error: "At least one room is required." }, { status: 400 });
    for (const room of rooms) {
      const schoolId = Number(room.schoolId); const branchId = Number(room.branchId);
      if (!schoolId || !branchId || !String(room.roomNumber || "").trim() || !Number(room.capacity)) return NextResponse.json({ error: "Each room needs school, branch, room number, and capacity." }, { status: 400 });
      if (!hasScopeAccess(authorization, { schoolId, branchId })) return NextResponse.json({ error: "Room is outside your assigned scope." }, { status: 403 });
    }
    const created = await prisma.$transaction(rooms.map((room) => prisma.room.create({ data: { schoolId: Number(room.schoolId), branchId: Number(room.branchId), roomNumber: String(room.roomNumber).trim(), capacity: Number(room.capacity), floor: room.floor || null, type: room.type || null, supervisor: room.supervisor || null } })));
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

