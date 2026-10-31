import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  requireTransportManage,
  requireTransportRead,
  transportError,
  transportScopeWhere,
  vehicleWriteData,
} from "@/src/lib/transport/scopedTransport";

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireTransportRead(request);
    const vehicles = await prisma.fleetVehicle.findMany({ where: transportScopeWhere(authorization), orderBy: { id: "asc" } });
    return NextResponse.json(vehicles);
  } catch (error) {
    return transportError(error, "Failed to fetch vehicles.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireTransportManage(request);
    const vehicle = await prisma.fleetVehicle.create({
      data: await vehicleWriteData(await request.json(), authorization, { creating: true }),
    });
    return NextResponse.json(vehicle, { status: 201 });
  } catch (error) {
    return transportError(error, "Failed to create vehicle.");
  }
}
