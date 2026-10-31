import { NextResponse } from "next/server";
import { AttendanceStatus, ClassName } from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  hasPermission,
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const allowedStatuses = new Set<AttendanceStatus>([
  AttendanceStatus.PRESENT,
  AttendanceStatus.ABSENT,
  AttendanceStatus.HOLIDAY,
  AttendanceStatus.WEEKLY_HOLIDAY,
]);

function asPositiveInt(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function dateOnly(value: unknown) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function classScope(schoolClass: { id: number; schoolId: number; branchId: number }) {
  return { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
}

function schoolClassName(value: unknown) {
  if (typeof value !== "string" || !value.trim()) {
    throw new PanelAuthorizationError(400, "A valid class name is required.");
  }
  const normalized = value.trim().toUpperCase();
  if (!Object.values(ClassName).includes(normalized as ClassName)) {
    throw new PanelAuthorizationError(400, "Invalid class name.");
  }
  return normalized as ClassName;
}

async function resolveScopedClass(request: Request, permission: string, requestedClassName: unknown) {
  const authorization = await requirePanelPermission(request, permission);
  const name = schoolClassName(requestedClassName);
  const requestedClassId = asPositiveInt(new URL(request.url).searchParams.get("classId"));
  const schoolClassSelect = { id: true, name: true, section: true, schoolId: true, branchId: true, academicYear: true, classTeacherId: true } as const;

  // An attendance screen can name a class (for backwards compatibility), but
  // a class name alone is not enough in a multi-branch school. New screens pass
  // the actual class-section id and are always checked against the current
  // employee's school/branch/class scope on the server.
  if (requestedClassId) {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: requestedClassId },
      select: schoolClassSelect,
    });
    if (!schoolClass || schoolClass.name !== name) {
      throw new PanelAuthorizationError(404, "The requested class-section is not available.");
    }
    if (!hasScopeAccess(authorization, classScope(schoolClass))) {
      throw new PanelAuthorizationError(403, "You do not have access to this class attendance.");
    }
    return { authorization, schoolClass };
  }

  const candidates = await prisma.schoolClass.findMany({
    where: { name },
    select: schoolClassSelect,
    orderBy: { academicYear: "desc" },
  });
  if (!candidates.length) {
    throw new PanelAuthorizationError(404, "Class not found.");
  }
  const currentAcademicYear = new Date().getFullYear();
  const schoolClass = candidates.find((candidate) => candidate.academicYear === currentAcademicYear && hasScopeAccess(authorization, classScope(candidate)))
    || candidates.find((candidate) => hasScopeAccess(authorization, classScope(candidate)));
  if (!schoolClass) {
    throw new PanelAuthorizationError(403, "You do not have access to this class attendance.");
  }
  return { authorization, schoolClass };
}

async function requireScopedStudent(schoolClass: { id: number; schoolId: number; branchId: number }, rawStudentId: unknown) {
  const studentId = asPositiveInt(rawStudentId);
  if (!studentId) throw new PanelAuthorizationError(400, "A valid student is required.");
  const student = await prisma.student.findFirst({
    where: {
      id: studentId,
      classId: schoolClass.id,
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
    },
    select: { id: true },
  });
  if (!student) throw new PanelAuthorizationError(404, "Student not found in this class.");
  return student;
}

function authorizationResponse(error: unknown, operation: string) {
  if (error instanceof PanelAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Attendance ${operation} failed`, error);
  return NextResponse.json({ error: `Failed to ${operation} attendance.` }, { status: 500 });
}

function pagination(request: Request) {
  const query = new URL(request.url).searchParams;
  const page = Math.max(asPositiveInt(query.get("page")) || 1, 1);
  const pageSize = Math.min(Math.max(asPositiveInt(query.get("pageSize")) || 10, 1), 100);
  return { page, pageSize };
}

function formatLeaveRequest(request: {
  id: number;
  fromDate: Date;
  toDate: Date;
  reason: string;
  approved: boolean;
  approvedAt: Date | null;
  student: { id: number; firstName: string; lastName: string };
}) {
  return {
    id: request.id,
    studentId: request.student.id,
    studentName: `${request.student.firstName} ${request.student.lastName}`,
    fromDate: request.fromDate.toISOString(),
    toDate: request.toDate.toISOString(),
    reason: request.reason,
    approved: request.approved,
    approvedAt: request.approvedAt ? request.approvedAt.toISOString() : null,
  };
}

function leaveStatusWhere(status: string | null) {
  if (!status || status === "ALL") return {};
  if (status === "APPROVED") return { approved: true };
  // The legacy schema stores a Boolean, so false represents an unapproved
  // request. There is no separate persisted rejection state yet.
  if (status === "PENDING" || status === "REJECTED") return { approved: false };
  throw new PanelAuthorizationError(400, "Invalid leave-request status.");
}

function assertAttendanceWriteAuthority(
  authorization: Awaited<ReturnType<typeof requirePanelPermission>>,
  schoolClass: { classTeacherId: number | null },
  { allowEmergencyAttendance = false }: { allowEmergencyAttendance?: boolean } = {},
) {
  const emergencyAttendanceRoles = new Set(["GCI", "COEF", "PRINCIPAL"]);
  const roleCodes = new Set([authorization.user.role, ...authorization.roles.map((role) => role.code)]
    .filter(Boolean)
    .map((role) => String(role).toUpperCase()));
  const canHandleEmergencyAttendance = allowEmergencyAttendance
    && [...emergencyAttendanceRoles].some((role) => roleCodes.has(role));
  if (schoolClass.classTeacherId !== authorization.user.id && !hasPermission(authorization, "class.manage") && !canHandleEmergencyAttendance) {
    throw new PanelAuthorizationError(403, "Only the assigned class teacher or an in-scope academic administrator can manage attendance or leave requests.");
  }
}

export async function getAttendanceRegister(request: Request, className: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const { page, pageSize } = pagination(request);
    const requestedDate = new URL(request.url).searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const attendanceDate = dateOnly(requestedDate);
    if (!attendanceDate) return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });

    const where = { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, status: "ACTIVE" };
    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true, firstName: true, middleName: true, lastName: true, rollNumber: true,
          guardianName: true, guardianRelation: true, guardianContact: true,
          attendance: { where: { date: attendanceDate }, select: { status: true }, take: 1 },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rollNumber: "asc" },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      students: students.map((student) => ({
        id: student.id,
        firstName: student.firstName,
        middleName: student.middleName || "",
        lastName: student.lastName,
        rollNumber: student.rollNumber || "N/A",
        guardianName: student.guardianName || "Not recorded",
        guardianRelation: student.guardianRelation || "",
        guardianContact: student.guardianContact || "Not recorded",
        status: student.attendance[0]?.status || "ABSENT",
      })),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
      class: {
        id: schoolClass.id,
        name: schoolClass.name,
        section: schoolClass.section,
        academicYear: schoolClass.academicYear,
        schoolId: schoolClass.schoolId,
        branchId: schoolClass.branchId,
      },
    });
  } catch (error) {
    return authorizationResponse(error, "fetch class");
  }
}

export async function getStudentAttendance(request: Request, className: unknown, rawStudentId: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const student = await requireScopedStudent(schoolClass, rawStudentId);
    const requestedDate = new URL(request.url).searchParams.get("date") || new Date().toISOString().slice(0, 10);
    const attendanceDate = dateOnly(requestedDate);
    if (!attendanceDate) return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
    const attendance = await prisma.attendance.findUnique({ where: { studentId_date: { studentId: student.id, date: attendanceDate } } });
    return NextResponse.json({ attendance });
  } catch (error) {
    return authorizationResponse(error, "fetch student");
  }
}

export async function getStudentAttendanceHistory(request: Request, className: unknown, rawStudentId: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const student = await requireScopedStudent(schoolClass, rawStudentId);
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid month format. Expected YYYY-MM" }, { status: 400 });
    }
    const [year, monthIndex] = month.split("-").map(Number);
    if (monthIndex < 1 || monthIndex > 12) {
      return NextResponse.json({ error: "Invalid month number" }, { status: 400 });
    }
    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
    const endDate = new Date(Date.UTC(year, monthIndex, 1));
    const attendanceRecords = await prisma.attendance.findMany({
      where: { studentId: student.id, date: { gte: startDate, lt: endDate } },
      select: { id: true, date: true, status: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({
      attendanceRecords: attendanceRecords.map((record) => ({ ...record, date: record.date.toISOString().slice(0, 10) })),
    });
  } catch (error) {
    return authorizationResponse(error, "fetch attendance history");
  }
}

export async function getMonthlyAttendance(request: Request, className: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "A valid month (YYYY-MM) is required." }, { status: 400 });
    }
    const [year, monthIndex] = month.split("-").map(Number);
    if (monthIndex < 1 || monthIndex > 12) {
      return NextResponse.json({ error: "Invalid month number" }, { status: 400 });
    }
    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
    const endDate = new Date(Date.UTC(year, monthIndex, 1));
    const [students, records] = await Promise.all([
      prisma.student.findMany({
        where: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, status: "ACTIVE" },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { id: "asc" },
      }),
      prisma.attendance.findMany({
        where: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, date: { gte: startDate, lt: endDate } },
        select: { studentId: true, date: true, status: true },
        orderBy: { studentId: "asc" },
      }),
    ]);
    const byStudent = new Map<number, Record<string, string>>();
    records.forEach((record) => {
      const attendance = byStudent.get(record.studentId) || {};
      attendance[record.date.toISOString().slice(0, 10)] = record.status;
      byStudent.set(record.studentId, attendance);
    });
    return NextResponse.json({
      students: students.map((student) => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        attendance: byStudent.get(student.id) || {},
      })),
    });
  } catch (error) {
    return authorizationResponse(error, "fetch monthly");
  }
}

export async function writeStudentAttendance(request: Request, className: unknown, rawStudentId: unknown) {
  try {
    const { authorization, schoolClass } = await resolveScopedClass(request, "attendance.manage", className);
    assertAttendanceWriteAuthority(authorization, schoolClass, { allowEmergencyAttendance: true });
    const student = await requireScopedStudent(schoolClass, rawStudentId);
    const payload = await request.json();
    const attendanceDate = dateOnly(payload?.date);
    if (!allowedStatuses.has(payload?.status as AttendanceStatus)) {
      return NextResponse.json({ error: "Invalid attendance status" }, { status: 400 });
    }
    if (!attendanceDate) {
      return NextResponse.json({ error: "A valid date (YYYY-MM-DD) is required." }, { status: 400 });
    }
    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId: student.id, date: attendanceDate } },
      update: { status: payload.status },
      create: {
        studentId: student.id,
        classId: schoolClass.id,
        branchId: schoolClass.branchId,
        schoolId: schoolClass.schoolId,
        date: attendanceDate,
        status: payload.status as AttendanceStatus,
      },
    });
    return NextResponse.json({ attendance, message: "Attendance updated successfully" });
  } catch (error) {
    return authorizationResponse(error, "update");
  }
}

export async function getClassLeaveRequests(request: Request, className: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const { page, pageSize } = pagination(request);
    const status = new URL(request.url).searchParams.get("status");
    const where = {
      student: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId },
      ...leaveStatusWhere(status),
    };
    const [leaveRequests, totalCount] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leaveRequest.count({ where }),
    ]);
    return NextResponse.json({
      leaveRequests: leaveRequests.map(formatLeaveRequest),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
      className: `${schoolClass.name}${schoolClass.section ? `-${schoolClass.section}` : ""}`,
    });
  } catch (error) {
    return authorizationResponse(error, "fetch leave requests");
  }
}

export async function getCurrentClassTeacherLeaveRequests(request: Request) {
  try {
    const authorization = await requirePanelPermission(request, "attendance.read");
    const classes = await prisma.schoolClass.findMany({
      where: { classTeacherId: authorization.user.id },
      select: { id: true, name: true, section: true, schoolId: true, branchId: true, academicYear: true, classTeacherId: true },
      orderBy: { academicYear: "desc" },
    });
    const schoolClass = classes.find((candidate) => hasScopeAccess(authorization, classScope(candidate)));
    if (!schoolClass) {
      return NextResponse.json({ error: "No in-scope class-teacher assignment is available." }, { status: 403 });
    }
    const { page, pageSize } = pagination(request);
    const status = new URL(request.url).searchParams.get("status");
    const where = {
      student: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId },
      ...leaveStatusWhere(status),
    };
    const [leaveRequests, totalCount] = await Promise.all([
      prisma.leaveRequest.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { student: { select: { id: true, firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.leaveRequest.count({ where }),
    ]);
    return NextResponse.json({
      leaveRequests: leaveRequests.map(formatLeaveRequest),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
      className: `${schoolClass.name}${schoolClass.section ? `-${schoolClass.section}` : ""}`,
    });
  } catch (error) {
    return authorizationResponse(error, "fetch class-teacher leave requests");
  }
}

export async function getStudentLeaveRequestHistory(request: Request, className: unknown, rawStudentId: unknown) {
  try {
    const { schoolClass } = await resolveScopedClass(request, "attendance.read", className);
    const student = await requireScopedStudent(schoolClass, rawStudentId);
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid month format. Expected YYYY-MM" }, { status: 400 });
    }
    const [year, monthIndex] = month.split("-").map(Number);
    if (monthIndex < 1 || monthIndex > 12) {
      return NextResponse.json({ error: "Invalid month number" }, { status: 400 });
    }
    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
    const endDate = new Date(Date.UTC(year, monthIndex, 1));
    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { studentId: student.id, fromDate: { lt: endDate }, toDate: { gte: startDate } },
      select: { id: true, fromDate: true, toDate: true, reason: true, approved: true, approvedAt: true },
      orderBy: { fromDate: "asc" },
    });
    return NextResponse.json({
      leaveRequests: leaveRequests.map((leaveRequest) => ({
        id: leaveRequest.id,
        fromDate: leaveRequest.fromDate.toISOString(),
        toDate: leaveRequest.toDate.toISOString(),
        reason: leaveRequest.reason,
        approved: leaveRequest.approved,
        approvedAt: leaveRequest.approvedAt ? leaveRequest.approvedAt.toISOString() : null,
      })),
    });
  } catch (error) {
    return authorizationResponse(error, "fetch leave-request history");
  }
}

export async function updateClassLeaveRequest(request: Request, className: unknown, rawRequestId: unknown) {
  try {
    const { authorization, schoolClass } = await resolveScopedClass(request, "attendance.manage", className);
    assertAttendanceWriteAuthority(authorization, schoolClass);
    const requestId = asPositiveInt(rawRequestId);
    if (!requestId) return NextResponse.json({ error: "A valid leave request is required." }, { status: 400 });
    const payload = await request.json();
    if (typeof payload?.approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean." }, { status: 400 });
    }
    const leaveRequest = await prisma.leaveRequest.findFirst({
      where: { id: requestId, student: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId } },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!leaveRequest) return NextResponse.json({ error: "Leave request not found in this class." }, { status: 404 });
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: { approved: payload.approved, approvedById: authorization.user.id, approvedAt: new Date() },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });
    return NextResponse.json({ leaveRequest: formatLeaveRequest(updated), message: "Leave request updated successfully" });
  } catch (error) {
    return authorizationResponse(error, "update leave request");
  }
}

export async function updateCurrentClassTeacherLeaveRequest(request: Request, rawRequestId: unknown) {
  try {
    const authorization = await requirePanelPermission(request, "attendance.manage");
    const requestId = asPositiveInt(rawRequestId);
    if (!requestId) return NextResponse.json({ error: "A valid leave request is required." }, { status: 400 });
    const payload = await request.json();
    if (typeof payload?.approved !== "boolean") {
      return NextResponse.json({ error: "approved must be a boolean." }, { status: 400 });
    }
    const leaveRequest = await prisma.leaveRequest.findUnique({
      where: { id: requestId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            class: { select: { id: true, schoolId: true, branchId: true, classTeacherId: true } },
          },
        },
      },
    });
    if (!leaveRequest) return NextResponse.json({ error: "Leave request not found." }, { status: 404 });
    const schoolClass = leaveRequest.student.class;
    if (!hasScopeAccess(authorization, classScope(schoolClass))) {
      return NextResponse.json({ error: "You do not have access to this leave request." }, { status: 403 });
    }
    assertAttendanceWriteAuthority(authorization, schoolClass);
    const updated = await prisma.leaveRequest.update({
      where: { id: leaveRequest.id },
      data: { approved: payload.approved, approvedById: authorization.user.id, approvedAt: new Date() },
      include: { student: { select: { id: true, firstName: true, lastName: true } } },
    });
    return NextResponse.json({
      leaveRequest: formatLeaveRequest(updated),
      message: `Leave request ${payload.approved ? "approved" : "rejected"} successfully`,
    });
  } catch (error) {
    return authorizationResponse(error, "update class-teacher leave request");
  }
}
