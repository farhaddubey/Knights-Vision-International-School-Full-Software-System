import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  requireTransportManage,
  requireTransportRead,
  routeId,
  assertTransportScope,
  transportError,
  vehicleDocumentWriteData,
} from "@/src/lib/transport/scopedTransport";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportRead(request);
    const { id: rawId } = await params;
    const document = await prisma.vehicleDocument.findUnique({
      where: { id: routeId(rawId, "Vehicle document ID") },
      include: { vehicle: true },
    });
    if (!document) return NextResponse.json({ error: "Vehicle document not found." }, { status: 404 });
    assertTransportScope(authorization, document.vehicle);
    return NextResponse.json(document);
  } catch (error) {
    return transportError(error, "Failed to fetch vehicle document.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportManage(request);
    const { id: rawId } = await params;
    const existing = await prisma.vehicleDocument.findUnique({ where: { id: routeId(rawId, "Vehicle document ID") }, include: { vehicle: true } });
    if (!existing) return NextResponse.json({ error: "Vehicle document not found." }, { status: 404 });
    assertTransportScope(authorization, existing.vehicle);
    const document = await prisma.vehicleDocument.update({
      where: { id: routeId(rawId, "Vehicle document ID") },
      data: await vehicleDocumentWriteData(await request.json(), authorization),
    });
    return NextResponse.json(document);
  } catch (error) {
    return transportError(error, "Failed to update vehicle document.");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    const authorization = await requireTransportManage(request);
    const { id: rawId } = await params;
    const existing = await prisma.vehicleDocument.findUnique({ where: { id: routeId(rawId, "Vehicle document ID") }, include: { vehicle: true } });
    if (!existing) return NextResponse.json({ error: "Vehicle document not found." }, { status: 404 });
    assertTransportScope(authorization, existing.vehicle);
    await prisma.vehicleDocument.delete({ where: { id: existing.id } });
    return NextResponse.json({ message: "Vehicle document deleted successfully." });
  } catch (error) {
    return transportError(error, "Failed to delete vehicle document.");
  }
}
