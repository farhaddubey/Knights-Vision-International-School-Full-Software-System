import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  combineWhere,
  errorResponse,
  pagination,
  requireAdditionalPermission,
  requireAdmissionRead,
  scopeWhere,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";

const CLASS_NAMES = new Set(["LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ"]);

export async function GET(request, context) {
  try {
    const authorization = await requireAdmissionRead(request);
    requireAdditionalPermission(authorization, "student.read", "Readmission eligibility requires student-read permission.");
    const params = await context?.params;
    const className = String(params?.className || "").toUpperCase();
    if (!CLASS_NAMES.has(className)) return NextResponse.json({ error: "Invalid class name." }, { status: 400 });
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const academicYear = validYear(searchParams.get("academicYear"));
    if (!academicYear) return NextResponse.json({ error: "academicYear must be between 2000 and 2100." }, { status: 400 });
    const where = combineWhere(scopeWhere(authorization), { academicYear, class: { name: className } });
    const [students, total] = await Promise.all([
      prisma.student.findMany({ where, include: { class: { select: { name: true, section: true } } }, skip, take: pageSize, orderBy: { firstName: "asc" } }),
      prisma.student.count({ where }),
    ]);
    return NextResponse.json({ students, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch students eligible for readmission.");
  }
}
