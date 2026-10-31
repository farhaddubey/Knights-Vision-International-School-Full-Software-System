import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

function routeId(value) { const id = Number(value); return Number.isInteger(id) && id > 0 ? id : null; }
function canAccess(authorization, room) { return hasScopeAccess(authorization, { schoolId: room.schoolId, branchId: room.branchId }); }

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.read");
    const { id } = await context.params; const roomId = routeId(id);
    if (!roomId) return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
    const room = await prisma.room.findUnique({ where: { id: roomId }, include: { school: { select: { id: true, name: true } }, branch: { select: { id: true, name: true } } } });
    if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
    if (!canAccess(authorization, room)) return NextResponse.json({ error: "Room is outside your assigned scope." }, { status: 403 });
    return NextResponse.json(room);
  } catch (error) { return authorizationErrorResponse(error); }
}

export async function PUT(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.manage");
    const { id } = await context.params; const roomId = routeId(id);
    if (!roomId) return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
    const current = await prisma.room.findUnique({ where: { id: roomId } });
    if (!current) return NextResponse.json({ error: "Room not found." }, { status: 404 });
    if (!canAccess(authorization, current)) return NextResponse.json({ error: "Room is outside your assigned scope." }, { status: 403 });
    const body = await request.json(); const schoolId = Number(body.schoolId); const branchId = Number(body.branchId);
    if (!schoolId || !branchId || !String(body.roomNumber || "").trim() || !Number(body.capacity)) return NextResponse.json({ error: "School, branch, room number, and capacity are required." }, { status: 400 });
    if (!hasScopeAccess(authorization, { schoolId, branchId })) return NextResponse.json({ error: "The new room scope is not assigned to you." }, { status: 403 });
    const room = await prisma.room.update({ where: { id: roomId }, data: { schoolId, branchId, roomNumber: String(body.roomNumber).trim(), capacity: Number(body.capacity), floor: body.floor || null, type: body.type || null, supervisor: body.supervisor || null } });
    return NextResponse.json(room);
  } catch (error) { return authorizationErrorResponse(error); }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.manage");
    const { id } = await context.params; const roomId = routeId(id);
    if (!roomId) return NextResponse.json({ error: "Invalid room ID." }, { status: 400 });
    const room = await prisma.room.findUnique({ where: { id: roomId } });
    if (!room) return NextResponse.json({ error: "Room not found." }, { status: 404 });
    if (!canAccess(authorization, room)) return NextResponse.json({ error: "Room is outside your assigned scope." }, { status: 403 });
    await prisma.room.delete({ where: { id: roomId } });
    return NextResponse.json({ message: "Room deleted successfully." });
  } catch (error) { return authorizationErrorResponse(error); }
}
