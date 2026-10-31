import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  applicationStatus,
  combineWhere,
  errorResponse,
  pagination,
  requireAdmissionRead,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    const status = applicationStatus(searchParams.get("status") || "NOT_QUALIFIED", { required: true });
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), { academicYear, status });
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({ where, skip, take: pageSize, include: { class: { select: { name: true, section: true } } }, orderBy: { createdAt: "desc" } }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch non-qualified admission applications.");
  }
}
