import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { CLASS_NAMES, lifecycleErrorResponse } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

function pageValue(value, fallback, maximum) {
  const result = Number.parseInt(String(value || fallback), 10);
  return Number.isInteger(result) && result > 0 ? Math.min(result, maximum) : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { searchParams } = new URL(request.url);
    const page = pageValue(searchParams.get("page"), 1, 100_000);
    const pageSize = pageValue(searchParams.get("pageSize"), 30, 200);
    const className = String(searchParams.get("className") || "").trim().toUpperCase();
    const academicYear = searchParams.get("academicYear");
    const search = String(searchParams.get("search") || "").trim();
    const status = String(searchParams.get("status") || "").trim().toUpperCase();

    if (className && !CLASS_NAMES.has(className)) return NextResponse.json({ error: "Invalid class name." }, { status: 400 });
    if (status && !["ACTIVE", "INACTIVE", "INACTIVE_WITH_DUE", "TRANSFERRED"].includes(status)) {
      return NextResponse.json({ error: "Invalid student status." }, { status: 400 });
    }
    const year = academicYear ? Number.parseInt(academicYear, 10) : null;
    if (academicYear && (!Number.isInteger(year) || year < 2000 || year > 2100)) {
      return NextResponse.json({ error: "Invalid academic year." }, { status: 400 });
    }

    const scopedWhere = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const filters = [scopedWhere];
    if (className) filters.push({ class: { name: className } });
    if (status) filters.push({ status });
    if (year) filters.push({ enrollments: { some: { academicYear: year } } });
    if (search) {
      filters.push({
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { admissionNumber: { contains: search, mode: "insensitive" } },
          { guardianContact: { contains: search, mode: "insensitive" } },
        ],
      });
    }
    const where = filters.length === 1 ? filters[0] : { AND: filters };
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        select: {
          id: true,
          admissionNumber: true,
          rollNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          guardianName: true,
          guardianContact: true,
          status: true,
          academicYear: true,
          classId: true,
          branchId: true,
          schoolId: true,
          class: { select: { name: true, section: true } },
          enrollments: { orderBy: [{ academicYear: "desc" }, { createdAt: "desc" }], take: 3, select: { id: true, academicYear: true, status: true, decision: true, classId: true } },
          transferCertificateRequests: { orderBy: { createdAt: "desc" }, take: 1, select: { id: true, publicId: true, status: true, tcNumber: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);
    return NextResponse.json({ students, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to load the student directory.");
  }
}
