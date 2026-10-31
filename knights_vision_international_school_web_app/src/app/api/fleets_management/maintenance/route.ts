import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  maintenanceWriteData,
  requireTransportManage,
  requireTransportRead,
  transportError,
  transportScopeWhere,
} from "@/src/lib/transport/scopedTransport";

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireTransportRead(request);
    const logs = await prisma.maintenanceLog.findMany({
      where: { vehicle: { is: transportScopeWhere(authorization) } },
      include: { vehicle: true },
      orderBy: { serviceDate: "desc" },
    });
    return NextResponse.json(logs);
  } catch (error) {
    return transportError(error, "Failed to fetch maintenance logs.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireTransportManage(request);
    const log = await prisma.maintenanceLog.create({
      data: await maintenanceWriteData(await request.json(), authorization, { creating: true }),
    });
    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    return transportError(error, "Failed to create maintenance log.");
  }
}
