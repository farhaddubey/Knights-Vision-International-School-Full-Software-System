import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  combineWhere,
  errorResponse,
  pagination,
  positiveInteger,
  requireAdmissionRead,
  scopeWhere,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const classId = searchParams.get("classId") ? positiveInteger(searchParams.get("classId")) : null;
    if (searchParams.get("classId") && !classId) return NextResponse.json({ error: "classId must be valid." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), {
      ...(classId ? { classId } : {}),
    });
    const [applications, total] = await Promise.all([
      prisma.admissionTestApplication.findMany({
        where,
        skip,
        take: pageSize,
        include: { class: { select: { name: true, section: true } }, admission: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionTestApplication.count({ where }),
    ]);
    return NextResponse.json({ applications, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission test applications.");
  }
}
