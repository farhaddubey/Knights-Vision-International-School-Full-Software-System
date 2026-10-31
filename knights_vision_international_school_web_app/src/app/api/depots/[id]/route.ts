import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  depotWriteData,
  requireTransportManage,
  requireTransportRead,
  routeId,
  transportError,
} from "@/src/lib/transport/scopedTransport";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportRead(request);
    const { id: rawId } = await params;
    const depot = await prisma.depot.findUnique({
      where: { id: routeId(rawId, "Depot ID") },
      include: { vehicles: true },
    });
    if (!depot) return NextResponse.json({ error: "Depot not found." }, { status: 404 });
    return NextResponse.json(depot);
  } catch (error) {
    return transportError(error, "Failed to fetch depot.");
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportManage(request);
    const { id: rawId } = await params;
    const id = routeId(rawId, "Depot ID");
    const data = depotWriteData(await request.json());
    if (data.name) {
      const duplicate = await prisma.depot.findFirst({ where: { name: data.name, NOT: { id } } });
      if (duplicate) return NextResponse.json({ error: "Depot name already exists." }, { status: 409 });
    }
    const depot = await prisma.depot.update({ where: { id }, data });
    return NextResponse.json(depot);
  } catch (error) {
    return transportError(error, "Failed to update depot.");
  }
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await requireTransportManage(request);
    const { id: rawId } = await params;
    await prisma.depot.delete({ where: { id: routeId(rawId, "Depot ID") } });
    return NextResponse.json({ message: "Depot deleted." });
  } catch (error) {
    return transportError(error, "Failed to delete depot.");
  }
}
