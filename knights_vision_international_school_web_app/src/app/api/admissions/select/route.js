import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { errorResponse, requireAdmissionRead, scopeWhere } from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const applications = await prisma.admissionTestApplication.findMany({
      where: scopeWhere(authorization),
      select: { id: true, firstName: true, lastName: true },
      orderBy: { firstName: "asc" },
    });
    return NextResponse.json(applications);
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission selections.");
  }
}
