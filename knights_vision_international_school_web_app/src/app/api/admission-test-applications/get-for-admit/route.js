import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { errorResponse, pagination, requireAdmissionRead, scopeWhere } from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const where = scopeWhere(authorization);
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        skip,
        take: pageSize,
        select: {
          id: true, firstName: true, lastName: true, studentUid: true, admitCardNumber: true, category: true,
          status: true, schoolId: true, branchId: true, classId: true, academicYear: true, middleName: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission applications.");
  }
}
