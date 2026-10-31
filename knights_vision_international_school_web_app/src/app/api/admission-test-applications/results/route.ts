import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  combineWhere,
  errorResponse,
  pagination,
  requireAdmissionRead,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), { academicYear });
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: { class: { select: { name: true, section: true } } },
        orderBy: { firstName: "asc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission test results.");
  }
}
