import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  depotWriteData,
  requireTransportManage,
  requireTransportRead,
  transportError,
  transportScopeWhere,
} from "@/src/lib/transport/scopedTransport";

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireTransportRead(request);
    const name = new URL(request.url).searchParams.get("name")?.trim();
    const depots = await prisma.depot.findMany({
      where: { AND: [transportScopeWhere(authorization), ...(name ? [{ name: { contains: name, mode: "insensitive" } }] : [])] },
      orderBy: { id: "asc" },
      include: { vehicles: true },
    });
    return NextResponse.json(depots);
  } catch (error) {
    return transportError(error, "Failed to fetch depots.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireTransportManage(request);
    const data = await depotWriteData(await request.json(), authorization, { creating: true });
    const duplicate = await prisma.depot.findFirst({ where: { schoolId: data.schoolId, branchId: data.branchId, name: data.name } });
    if (duplicate) return NextResponse.json({ error: "Depot name already exists." }, { status: 409 });
    const depot = await prisma.depot.create({ data });
    return NextResponse.json(depot, { status: 201 });
  } catch (error) {
    return transportError(error, "Failed to create depot.");
  }
}
