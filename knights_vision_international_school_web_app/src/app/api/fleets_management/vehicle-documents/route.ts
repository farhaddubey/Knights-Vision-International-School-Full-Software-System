import { NextRequest, NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  requireTransportManage,
  requireTransportRead,
  transportError,
  transportScopeWhere,
  vehicleDocumentWriteData,
} from "@/src/lib/transport/scopedTransport";

export async function GET(request: NextRequest) {
  try {
    const authorization = await requireTransportRead(request);
    const documents = await prisma.vehicleDocument.findMany({
      where: { vehicle: { is: transportScopeWhere(authorization) } },
      include: { vehicle: true },
      orderBy: { uploadedAt: "desc" },
    });
    return NextResponse.json(documents);
  } catch (error) {
    return transportError(error, "Failed to fetch vehicle documents.");
  }
}

export async function POST(request: NextRequest) {
  try {
    const authorization = await requireTransportManage(request);
    const document = await prisma.vehicleDocument.create({
      data: await vehicleDocumentWriteData(await request.json(), authorization, { creating: true }),
    });
    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    return transportError(error, "Failed to create vehicle document.");
  }
}
