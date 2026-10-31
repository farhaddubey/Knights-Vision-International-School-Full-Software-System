import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  requireTransportManage,
  requireTransportRead,
  routeId,
  transportError,
  vehicleDetailInclude,
  vehicleWriteData,
} from "@/src/lib/transport/scopedTransport";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportRead(request);
    const { id: rawId } = await params;
    const vehicle = await prisma.fleetVehicle.findUnique({
      where: { id: routeId(rawId, "Vehicle ID") },
      include: vehicleDetailInclude,
    });
    if (!vehicle) return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    return NextResponse.json(vehicle);
  } catch (error) {
    return transportError(error, "Failed to fetch vehicle.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportManage(request);
    const { id: rawId } = await params;
    const vehicle = await prisma.fleetVehicle.update({
      where: { id: routeId(rawId, "Vehicle ID") },
      data: await vehicleWriteData(await request.json()),
    });
    return NextResponse.json(vehicle);
  } catch (error) {
    return transportError(error, "Failed to update vehicle.");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportManage(request);
    const { id: rawId } = await params;
    await prisma.fleetVehicle.delete({ where: { id: routeId(rawId, "Vehicle ID") } });
    return NextResponse.json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    return transportError(error, "Failed to delete vehicle.");
  }
}

// Existing fleet dialogs submit PATCH; retain that contract while PUT remains
// the canonical update verb.
export const PATCH = PUT;
