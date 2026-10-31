import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  hasPermission,
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const classNames = new Set([
  "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ",
]);
const communicationTypes = new Set(["GENERAL", "ALERT", "CALL", "SMS", "EMAIL", "MEETING"]);
const communicationMethods = new Set(["PHONE", "SMS", "WHATSAPP", "EMAIL", "IN_PERSON"]);
const broadCommunicationRoles = new Set([
  "SYSTEM_ADMIN", "SYSTEM_IN_CHARGE", "PRINCIPAL", "PRINCIPAL_HEAD", "HEAD_OF_DEPARTMENTS",
  "AIC", "ACADEMICS_IN_CHARGE", "GCI", "GUARDIAN_COMMUNICATION_IN_CHARGE",
]);

export class GuardianCommunicationValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "GuardianCommunicationValidationError";
    this.status = status;
  }
}

const has = (value, key) => Object.prototype.hasOwnProperty.call(value, key);

function positiveInteger(value, label) {
  const parsed = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new GuardianCommunicationValidationError(`${label} must be a positive whole number.`);
  }
  return parsed;
}

function optionalPositiveInteger(value, label) {
  if (value === null || value === undefined || value === "") return null;
  return positiveInteger(value, label);
}

function normalizedClassName(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new GuardianCommunicationValidationError("A valid class name is required.");
  }
  const normalized = value.trim().toUpperCase();
  if (!classNames.has(normalized)) throw new GuardianCommunicationValidationError("Invalid class name.");
  return normalized;
}

function requestInteger(request, key) {
  const value = new URL(request.url).searchParams.get(key);
  return value ? optionalPositiveInteger(value, key) : null;
}

function dateValue(value, label) {
  const parsed = new Date(value);
  if (!value || Number.isNaN(parsed.getTime())) {
    throw new GuardianCommunicationValidationError(`${label} must be a valid date.`);
  }
  return parsed;
}

function nullableText(value, label, max) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new GuardianCommunicationValidationError(`${label} must be text.`);
  const normalized = value.trim();
  if (normalized.length > max) throw new GuardianCommunicationValidationError(`${label} is too long.`);
  return normalized || null;
}

function enumValue(value, label, allowed) {
  if (typeof value !== "string" || !allowed.has(value)) {
    throw new GuardianCommunicationValidationError(`${label} is not a supported value.`);
  }
  return value;
}

function jsonValue(value, label) {
  if (value === null || value === undefined) return null;
  if (typeof value !== "object") throw new GuardianCommunicationValidationError(`${label} must be structured JSON.`);
  return value;
}

function classScope(schoolClass) {
  return { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
}

function isBroadCommunicationAuthority(authorization) {
  return hasPermission(authorization, "class.manage")
    || authorization.roles.some((role) => broadCommunicationRoles.has(role.code));
}

function isClassTeacherLimited(authorization) {
  return authorization.roles.some((role) => role.code === "CLASS_TEACHER") && !isBroadCommunicationAuthority(authorization);
}

/**
 * Resolves the class from the database before authorizing. Query/body values may
 * narrow the candidate only; they are never treated as scope evidence.
 */
export async function resolveScopedCommunicationClass(request, rawClassName, permission, rawClassId = null) {
  const authorization = await requirePanelPermission(request, permission);
  const name = normalizedClassName(rawClassName);
  const classId = optionalPositiveInteger(rawClassId, "classId") || requestInteger(request, "classId");
  const branchId = requestInteger(request, "branchId");
  const academicYear = requestInteger(request, "academicYear");

  const candidates = await prisma.schoolClass.findMany({
    where: { name, ...(classId ? { id: classId } : {}) },
    select: {
      id: true,
      name: true,
      schoolId: true,
      branchId: true,
      academicYear: true,
      classTeacherId: true,
    },
    orderBy: { academicYear: "desc" },
  });
  if (!candidates.length) throw new PanelAuthorizationError(404, "Class not found.");

  const requestedCandidate = candidates.filter((candidate) => (
    (!branchId || candidate.branchId === branchId)
    && (!academicYear || candidate.academicYear === academicYear)
  ));
  if (!requestedCandidate.length) {
    throw new GuardianCommunicationValidationError("The requested class, branch, and academic year do not match.");
  }

  const schoolClass = requestedCandidate.find((candidate) => hasScopeAccess(authorization, classScope(candidate)));
  if (!schoolClass) throw new PanelAuthorizationError(403, "You do not have access to this class communication.");
  if (isClassTeacherLimited(authorization) && schoolClass.classTeacherId !== authorization.user.id) {
    throw new PanelAuthorizationError(403, "Class teachers can manage guardian communication only for their assigned class.");
  }
  return { authorization, schoolClass };
}

async function scopedStudent(schoolClass, rawStudentId) {
  const id = positiveInteger(rawStudentId, "studentId");
  const student = await prisma.student.findFirst({
    where: {
      id,
      classId: schoolClass.id,
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
    },
    select: { id: true },
  });
  if (!student) throw new GuardianCommunicationValidationError("Student not found in the selected class.", 404);
  return student;
}

function pagination(request) {
  const page = requestInteger(request, "page") || 1;
  const pageSize = Math.min(requestInteger(request, "pageSize") || 10, 100);
  return { page, pageSize, skip: (page - 1) * pageSize };
}

function searchWhere(request) {
  const value = new URL(request.url).searchParams.get("searchQuery")?.trim();
  if (!value) return undefined;
  return [{ firstName: { contains: value, mode: "insensitive" } }, { middleName: { contains: value, mode: "insensitive" } }, { lastName: { contains: value, mode: "insensitive" } }];
}

function studentSelect() {
  return { id: true, firstName: true, middleName: true, lastName: true };
}

function withStudentName(student) {
  return {
    ...student,
    name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ").trim(),
  };
}

function formatMeetingNote(note) {
  return {
    ...note,
    // The panel's legacy labels are preserved while mapping to the actual
    // persisted Prisma fields.
    summary: note.summary_realization || "",
    detailedNotes: note.guardianInstruction || null,
    student: withStudentName(note.student),
  };
}

export function guardianCommunicationError(error, fallback) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 401 });
  }
  if (error instanceof GuardianCommunicationValidationError || error?.name === "GuardianCommunicationValidationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  if (error && typeof error === "object" && error.code === "P2003") {
    return NextResponse.json({ error: "The requested communication relationship does not exist." }, { status: 400 });
  }
  console.error("[Guardian communication]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function listGuardianCommunicationLogs(request, rawClassName) {
  const { schoolClass } = await resolveScopedCommunicationClass(request, rawClassName, "guardian_communication.read");
  const { page, pageSize, skip } = pagination(request);
  const nameSearch = searchWhere(request);
  const where = {
    classId: schoolClass.id,
    schoolId: schoolClass.schoolId,
    branchId: schoolClass.branchId,
    ...(nameSearch ? { student: { OR: nameSearch } } : {}),
  };
  const [logs, total] = await Promise.all([
    prisma.guardianCommunicationLog.findMany({
      where,
      include: { student: { select: studentSelect() } },
      orderBy: { recordedAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.guardianCommunicationLog.count({ where }),
  ]);
  return NextResponse.json({ logs: logs.map((log) => ({ ...log, student: withStudentName(log.student) })), totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function createGuardianCommunicationLogs(request, rawClassName) {
  // Authenticate before parsing client data so malformed input never bypasses
  // the endpoint's 401/403 boundary.
  await requirePanelPermission(request, "guardian_communication.manage");
  const body = await request.json();
  const logs = body?.logs;
  if (!Array.isArray(logs) || !logs.length) throw new GuardianCommunicationValidationError("At least one communication log is required.");
  const { authorization, schoolClass } = await resolveScopedCommunicationClass(
    request,
    rawClassName,
    "guardian_communication.manage",
    logs[0]?.classId,
  );
  const prepared = [];
  for (const log of logs) {
    if (optionalPositiveInteger(log?.classId, "classId") && positiveInteger(log.classId, "classId") !== schoolClass.id) {
      throw new GuardianCommunicationValidationError("Every communication log must belong to the selected class.");
    }
    const student = await scopedStudent(schoolClass, log?.studentId);
    prepared.push({
      studentId: student.id,
      classId: schoolClass.id,
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      communicationType: enumValue(log?.communicationType, "communicationType", communicationTypes),
      method: enumValue(log?.method, "method", communicationMethods),
      summary: nullableText(log?.summary, "summary", 200),
      details: jsonValue(log?.details, "details"),
      recordedById: authorization.user.id,
    });
  }
  const saved = await prisma.$transaction((tx) => Promise.all(prepared.map((data) => tx.guardianCommunicationLog.create({ data }))));
  return NextResponse.json({ logs: saved }, { status: 201 });
}

export async function listGuardianCallLogs(request, rawClassName) {
  const { schoolClass } = await resolveScopedCommunicationClass(request, rawClassName, "guardian_communication.read");
  const { page, pageSize, skip } = pagination(request);
  const nameSearch = searchWhere(request);
  const where = {
    classId: schoolClass.id,
    schoolId: schoolClass.schoolId,
    branchId: schoolClass.branchId,
    ...(nameSearch ? { student: { OR: nameSearch } } : {}),
  };
  const [logs, total] = await Promise.all([
    prisma.guardianCallLog.findMany({ where, include: { student: { select: studentSelect() } }, orderBy: { callDate: "desc" }, skip, take: pageSize }),
    prisma.guardianCallLog.count({ where }),
  ]);
  return NextResponse.json({ logs: logs.map((log) => ({ ...log, student: withStudentName(log.student) })), totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function createGuardianCallLogs(request, rawClassName) {
  await requirePanelPermission(request, "guardian_communication.manage");
  const body = await request.json();
  const logs = body?.logs;
  if (!Array.isArray(logs) || !logs.length) throw new GuardianCommunicationValidationError("At least one guardian call log is required.");
  const { authorization, schoolClass } = await resolveScopedCommunicationClass(
    request,
    rawClassName,
    "guardian_communication.manage",
    logs[0]?.classId,
  );
  const prepared = [];
  for (const log of logs) {
    if (optionalPositiveInteger(log?.classId, "classId") && positiveInteger(log.classId, "classId") !== schoolClass.id) {
      throw new GuardianCommunicationValidationError("Every call log must belong to the selected class.");
    }
    const student = await scopedStudent(schoolClass, log?.studentId);
    prepared.push({
      studentId: student.id,
      classId: schoolClass.id,
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      reportWeekStart: dateValue(log?.reportWeekStart, "reportWeekStart"),
      reportWeekEnd: dateValue(log?.reportWeekEnd, "reportWeekEnd"),
      callDate: dateValue(log?.callDate, "callDate"),
      issuesDiscussed: jsonValue(log?.issuesDiscussed, "issuesDiscussed"),
      guardianResponse: nullableText(log?.guardianResponse, "guardianResponse", 5000),
      calledById: authorization.user.id,
    });
  }
  const saved = await prisma.$transaction((tx) => Promise.all(prepared.map((data) => tx.guardianCallLog.create({ data }))));
  return NextResponse.json({ logs: saved }, { status: 201 });
}

export async function listParentTeacherMeetingNotes(request, rawClassName) {
  const { schoolClass } = await resolveScopedCommunicationClass(request, rawClassName, "guardian_communication.read");
  const { page, pageSize, skip } = pagination(request);
  const nameSearch = searchWhere(request);
  const where = {
    classId: schoolClass.id,
    schoolId: schoolClass.schoolId,
    branchId: schoolClass.branchId,
    ...(nameSearch ? { student: { OR: nameSearch } } : {}),
  };
  const [notes, total] = await Promise.all([
    prisma.parentTeacherMeetingNote.findMany({ where, include: { student: { select: studentSelect() } }, orderBy: { meetingDate: "desc" }, skip, take: pageSize }),
    prisma.parentTeacherMeetingNote.count({ where }),
  ]);
  return NextResponse.json({ notes: notes.map(formatMeetingNote), totalPages: Math.max(1, Math.ceil(total / pageSize)) });
}

export async function createParentTeacherMeetingNotes(request, rawClassName) {
  await requirePanelPermission(request, "guardian_communication.manage");
  const body = await request.json();
  const notes = body?.notes;
  if (!Array.isArray(notes) || !notes.length) throw new GuardianCommunicationValidationError("At least one parent-teacher meeting note is required.");
  const { authorization, schoolClass } = await resolveScopedCommunicationClass(
    request,
    rawClassName,
    "guardian_communication.manage",
    notes[0]?.classId,
  );
  const prepared = [];
  for (const note of notes) {
    if (optionalPositiveInteger(note?.classId, "classId") && positiveInteger(note.classId, "classId") !== schoolClass.id) {
      throw new GuardianCommunicationValidationError("Every meeting note must belong to the selected class.");
    }
    const student = await scopedStudent(schoolClass, note?.studentId);
    prepared.push({
      studentId: student.id,
      classId: schoolClass.id,
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      meetingDate: dateValue(note?.meetingDate, "meetingDate"),
      // Preserve the existing MUI payload labels using the actual schema fields.
      summary_realization: nullableText(note?.summary, "summary", 300),
      guardianInstruction: nullableText(note?.detailedNotes, "detailedNotes", 500),
      actionPoints: jsonValue(note?.actionPoints, "actionPoints"),
      guardianFeedback: nullableText(note?.guardianFeedback, "guardianFeedback", 5000),
      takenById: authorization.user.id,
    });
  }
  const saved = await prisma.$transaction((tx) => Promise.all(prepared.map((data) => tx.parentTeacherMeetingNote.create({ data }))));
  return NextResponse.json({ notes: saved.map((note) => ({ ...note, summary: note.summary_realization || "", detailedNotes: note.guardianInstruction || null })) }, { status: 201 });
}

export async function listCommunicationStudents(request, rawClassName) {
  const rawClassId = requestInteger(request, "classId");
  const { schoolClass } = await resolveScopedCommunicationClass(request, rawClassName, "guardian_communication.read", rawClassId);
  const students = await prisma.student.findMany({
    where: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId },
    select: studentSelect(),
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  return NextResponse.json({ students: students.map(withStudentName) });
}
