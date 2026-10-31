import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  maintenanceWriteData,
  requireTransportManage,
  requireTransportRead,
  routeId,
  assertTransportScope,
  transportError,
} from "@/src/lib/transport/scopedTransport";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportRead(request);
    const { id: rawId } = await params;
    const log = await prisma.maintenanceLog.findUnique({
      where: { id: routeId(rawId, "Maintenance log ID") },
      include: { vehicle: true },
    });
    if (!log) return NextResponse.json({ error: "Maintenance log not found." }, { status: 404 });
    assertTransportScope(authorization, log.vehicle);
    return NextResponse.json(log);
  } catch (error) {
    return transportError(error, "Failed to fetch maintenance log.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportManage(request);
    const { id: rawId } = await params;
    const existing = await prisma.maintenanceLog.findUnique({ where: { id: routeId(rawId, "Maintenance log ID") }, include: { vehicle: true } });
    if (!existing) return NextResponse.json({ error: "Maintenance log not found." }, { status: 404 });
    assertTransportScope(authorization, existing.vehicle);
    const log = await prisma.maintenanceLog.update({
      where: { id: existing.id },
      data: await maintenanceWriteData(await request.json(), authorization),
    });
    return NextResponse.json(log);
  } catch (error) {
    return transportError(error, "Failed to update maintenance log.");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportManage(request);
    const { id: rawId } = await params;
    const existing = await prisma.maintenanceLog.findUnique({ where: { id: routeId(rawId, "Maintenance log ID") }, include: { vehicle: true } });
    if (!existing) return NextResponse.json({ error: "Maintenance log not found." }, { status: 404 });
    assertTransportScope(authorization, existing.vehicle);
    await prisma.maintenanceLog.delete({ where: { id: existing.id } });
    return NextResponse.json({ message: "Maintenance log deleted successfully." });
  } catch (error) {
    return transportError(error, "Failed to delete maintenance log.");
  }
}
