import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  hasPermission,
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

export const dynamic = "force-dynamic";

function positiveInteger(value, fallback = null) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function dateOnly(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    if (!hasPermission(authorization, "attendance.read")) {
      throw new PanelAuthorizationError(403, "Your role is not authorised to view class attendance.");
    }

    const searchParams = new URL(request.url).searchParams;
    const classId = positiveInteger(searchParams.get("classId"));
    if (!classId) throw new PanelAuthorizationError(400, "A valid class-section id is required.");
    const date = dateOnly(searchParams.get("date") || new Date().toISOString().slice(0, 10));
    if (!date) throw new PanelAuthorizationError(400, "A valid attendance date is required.");
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(100, positiveInteger(searchParams.get("pageSize"), 30));
    const search = String(searchParams.get("search") || "").trim();

    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
      select: {
        id: true,
        name: true,
        section: true,
        academicYear: true,
        schoolId: true,
        branchId: true,
        branch: { select: { id: true, name: true, code: true, school: { select: { id: true, name: true } } } },
      },
    });
    if (!schoolClass) throw new PanelAuthorizationError(404, "Class-section not found.");
    if (!hasScopeAccess(authorization, { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id })) {
      throw new PanelAuthorizationError(403, "You cannot preview students outside your assigned class scope.");
    }

    const where = {
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      classId: schoolClass.id,
      status: "ACTIVE",
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { middleName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { admissionNumber: { contains: search, mode: "insensitive" } },
          { rollNumber: { contains: search, mode: "insensitive" } },
          { guardianContact: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };
    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          admissionNumber: true,
          rollNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          guardianName: true,
          guardianRelation: true,
          guardianContact: true,
          status: true,
          attendance: { where: { date }, select: { status: true }, take: 1 },
        },
        orderBy: [{ rollNumber: "asc" }, { firstName: "asc" }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      class: {
        id: schoolClass.id,
        name: schoolClass.name,
        section: schoolClass.section,
        academicYear: schoolClass.academicYear,
        branch: schoolClass.branch,
      },
      attendanceDate: date.toISOString().slice(0, 10),
      students: students.map((student) => ({
        ...student,
        attendanceStatus: student.attendance[0]?.status || "NOT_MARKED",
        attendance: undefined,
      })),
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      totalCount,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Class student preview]", error);
    return NextResponse.json({ error: "Unable to load the class student preview." }, { status: 500 });
  }
}
