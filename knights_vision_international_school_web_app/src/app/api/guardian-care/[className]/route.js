import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { resolveScopedCommunicationClass } from "@/src/lib/communications/scopedGuardianCommunication";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";

const communicationTypes = new Set(["GENERAL", "ALERT", "CALL", "SMS", "EMAIL", "MEETING"]);
const communicationMethods = new Set(["PHONE", "SMS", "WHATSAPP", "EMAIL", "IN_PERSON"]);
const priorities = new Set(["NORMAL", "HIGH", "URGENT"]);
const MAX_FEE_FOLLOW_UP_ATTEMPTS = 5;

function wholeNumber(value, field) {
  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) throw new PanelAuthorizationError(400, `${field} must be a positive whole number.`);
  return number;
}

function shortText(value, field, max, { required = false } = {}) {
  if (value === null || value === undefined || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  if (typeof value !== "string" || !value.trim() || value.trim().length > max) {
    throw new PanelAuthorizationError(400, `${field} must contain at most ${max} characters.`);
  }
  return value.trim();
}

function feeFollowUpYear(value) {
  const year = wholeNumber(value, "academicYear");
  if (year < 2000 || year > 2200) {
    throw new PanelAuthorizationError(400, "academicYear must be a valid calendar year.");
  }
  return year;
}

function classScope(schoolClass) {
  return { scopeType: "CLASS", schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
}

function studentSelect() {
  return {
    id: true,
    firstName: true,
    middleName: true,
    lastName: true,
    admissionNumber: true,
    guardianName: true,
    guardianRelation: true,
    guardianContact: true,
    guardianAddress: true,
    fatherName: true,
    fatherContact: true,
    motherName: true,
    motherContact: true,
  };
}

function formatStudent(student) {
  return { ...student, name: [student.firstName, student.middleName, student.lastName].filter(Boolean).join(" ") };
}

async function scopedStudent(schoolClass, rawStudentId) {
  const studentId = wholeNumber(rawStudentId, "studentId");
  const student = await prisma.student.findFirst({
    where: { id: studentId, classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId },
    select: studentSelect(),
  });
  if (!student) throw new PanelAuthorizationError(404, "Student not found in this class.");
  return student;
}

async function classStudents(schoolClass) {
  const students = await prisma.student.findMany({
    where: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId },
    select: studentSelect(),
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });
  return students.map(formatStudent);
}

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    const { schoolClass } = await resolveScopedCommunicationClass(request, className, "guardian_communication.read");
    const rawStudentId = new URL(request.url).searchParams.get("studentId");
    if (!rawStudentId) {
      return NextResponse.json({ schoolClass, students: await classStudents(schoolClass) });
    }
    const student = await scopedStudent(schoolClass, rawStudentId);
    const ownership = { studentId: student.id, classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId };
    const [communicationLogs, meetingNotes, callLogs, specialNotes, behaviourLogs, monthlyFees] = await Promise.all([
      prisma.guardianCommunicationLog.findMany({ where: ownership, orderBy: { recordedAt: "desc" }, take: 100 }),
      prisma.parentTeacherMeetingNote.findMany({ where: ownership, orderBy: { meetingDate: "desc" }, take: 100 }),
      prisma.guardianCallLog.findMany({ where: ownership, orderBy: { callDate: "desc" }, take: 100 }),
      prisma.guardianStudentSpecialNote.findMany({
        where: ownership,
        include: { createdBy: { select: { username: true, email: true } }, resolvedBy: { select: { username: true, email: true } } },
        orderBy: [{ isResolved: "asc" }, { createdAt: "desc" }],
      }),
      prisma.studentBehaviourLog.findMany({
        where: { studentId: student.id },
        select: { id: true, incidentDate: true, category: true, type: true, description: true, severityLevel: true, isResolved: true },
        orderBy: { incidentDate: "desc" },
        take: 50,
      }),
      prisma.monthlyFee.findMany({
        where: { studentId: student.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id },
        select: { id: true, month: true, year: true, totalDue: true, paidAmount: true, fineAmount: true, waivedAmount: true, status: true, dueDate: true },
        orderBy: [{ year: "desc" }, { month: "desc" }],
        take: 24,
      }),
    ]);
    const timeline = [
      ...communicationLogs.map((entry) => ({ id: `communication-${entry.id}`, at: entry.recordedAt, category: "COMMUNICATION", title: entry.summary || entry.communicationType, detail: entry.details, method: entry.method })),
      ...meetingNotes.map((entry) => ({ id: `meeting-${entry.id}`, at: entry.meetingDate, category: "MEETING", title: entry.summary_realization || "Guardian meeting", detail: { guardianInstruction: entry.guardianInstruction, guardianFeedback: entry.guardianFeedback, actionPoints: entry.actionPoints }, method: "IN_PERSON" })),
      ...callLogs.map((entry) => ({ id: `call-${entry.id}`, at: entry.callDate, category: "CALL", title: "Guardian call", detail: { issuesDiscussed: entry.issuesDiscussed, guardianResponse: entry.guardianResponse }, method: "PHONE" })),
    ].sort((left, right) => new Date(right.at).getTime() - new Date(left.at).getTime());
    const feeFollowUpCalls = communicationLogs.flatMap((entry) => {
      const details = entry.details && typeof entry.details === "object" ? entry.details : null;
      const attempt = Number(details?.feeFollowUpAttempt);
      const academicYear = Number(details?.feeFollowUpAcademicYear);
      if (
        details?.source !== "monthly-fee-followup"
        || !Number.isInteger(attempt)
        || attempt < 1
        || attempt > MAX_FEE_FOLLOW_UP_ATTEMPTS
        || !Number.isInteger(academicYear)
      ) return [];
      return [{ id: entry.id, attempt, academicYear, recordedAt: entry.recordedAt, recordedById: entry.recordedById }];
    });
    return NextResponse.json({ schoolClass, student: formatStudent(student), timeline, specialNotes, behaviourLogs, monthlyFees, feeFollowUpCalls });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Guardian care workspace]", error);
    return NextResponse.json({ error: "Unable to load guardian and student care information." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = await params;
    await requirePanelPermission(request, "guardian_communication.manage");
    const body = await request.json();
    const { authorization, schoolClass } = await resolveScopedCommunicationClass(request, className, "guardian_communication.manage", body?.classId);
    const student = await scopedStudent(schoolClass, body?.studentId);
    const action = typeof body?.action === "string" ? body.action.trim().toUpperCase() : "";
    if (action === "FEE_FOLLOW_UP_CALL") {
      const attempt = wholeNumber(body?.attempt, "attempt");
      if (attempt > MAX_FEE_FOLLOW_UP_ATTEMPTS) {
        throw new PanelAuthorizationError(400, `Only ${MAX_FEE_FOLLOW_UP_ATTEMPTS} recorded fee follow-up calls are supported.`);
      }
      const academicYear = feeFollowUpYear(body?.academicYear);
      const followUpKey = `${academicYear}:${attempt}`;

      // The transaction-level advisory lock makes the visual green/locked
      // state authoritative: two tabs cannot record the same numbered call.
      const result = await prisma.$transaction(async (tx) => {
        // Prisma binds JavaScript numbers as bigint. PostgreSQL's two-key
        // advisory-lock overload accepts int4/int4, so cast both values
        // explicitly; otherwise the transaction fails before the call marker
        // is created with "function ... bigint, bigint does not exist".
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(${schoolClass.id}::integer, ${student.id}::integer)`;
        const ownership = {
          studentId: student.id,
          classId: schoolClass.id,
          schoolId: schoolClass.schoolId,
          branchId: schoolClass.branchId,
        };
        const existing = await tx.guardianCommunicationLog.findFirst({
          where: {
            ...ownership,
            details: { path: ["feeFollowUpKey"], equals: followUpKey },
          },
          orderBy: { recordedAt: "desc" },
        });
        if (existing) return { interaction: existing, alreadyRecorded: true };
        const interaction = await tx.guardianCommunicationLog.create({
          data: {
            ...ownership,
            communicationType: "CALL",
            method: "PHONE",
            summary: `Fee follow-up call ${attempt} of ${MAX_FEE_FOLLOW_UP_ATTEMPTS}`,
            details: {
              source: "monthly-fee-followup",
              feeFollowUpAttempt: attempt,
              feeFollowUpAcademicYear: academicYear,
              feeFollowUpKey: followUpKey,
            },
            recordedById: authorization.user.id,
          },
        });
        return { interaction, alreadyRecorded: false };
      });
      if (!result.alreadyRecorded) {
        await appendEnterpriseAuditEvent({
          actorUserId: authorization.user.id,
          action: "guardian_care.fee_follow_up_call.record",
          resource: "GuardianCommunicationLog",
          resourceId: result.interaction.id,
          scope: classScope(schoolClass),
          afterData: { studentId: student.id, academicYear, attempt },
        });
      }
      return NextResponse.json(result, { status: result.alreadyRecorded ? 200 : 201 });
    }
    if (action === "INTERACTION") {
      const communicationType = String(body?.communicationType || "").trim().toUpperCase();
      const method = String(body?.method || "").trim().toUpperCase();
      if (!communicationTypes.has(communicationType) || !communicationMethods.has(method)) {
        throw new PanelAuthorizationError(400, "Select a valid interaction type and contact method.");
      }
      const summary = shortText(body?.summary, "summary", 200, { required: true });
      const details = shortText(body?.details, "details", 2000);
      const interaction = await prisma.guardianCommunicationLog.create({
        data: {
          studentId: student.id,
          classId: schoolClass.id,
          schoolId: schoolClass.schoolId,
          branchId: schoolClass.branchId,
          communicationType,
          method,
          summary,
          details: details ? { note: details, source: "guardian-care-workspace" } : { source: "guardian-care-workspace" },
          recordedById: authorization.user.id,
        },
      });
      await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "guardian_care.interaction.record", resource: "GuardianCommunicationLog", resourceId: interaction.id, scope: classScope(schoolClass), afterData: { studentId: student.id, communicationType, method } });
      return NextResponse.json({ interaction }, { status: 201 });
    }
    if (action === "SPECIAL_NOTE") {
      const note = shortText(body?.note, "note", 3000, { required: true });
      const priority = String(body?.priority || "NORMAL").trim().toUpperCase();
      if (!priorities.has(priority)) throw new PanelAuthorizationError(400, "Select a valid special-note priority.");
      const specialNote = await prisma.guardianStudentSpecialNote.create({
        data: { studentId: student.id, classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, note, priority, createdById: authorization.user.id },
      });
      await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "guardian_care.special_note.create", resource: "GuardianStudentSpecialNote", resourceId: specialNote.id, scope: classScope(schoolClass), afterData: { studentId: student.id, priority } });
      return NextResponse.json({ specialNote }, { status: 201 });
    }
    throw new PanelAuthorizationError(400, "action must be INTERACTION, FEE_FOLLOW_UP_CALL, or SPECIAL_NOTE.");
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Guardian care workspace]", error);
    return NextResponse.json({ error: "Unable to save guardian and student care information." }, { status: 500 });
  }
}

export async function PATCH(request, { params }) {
  try {
    const { className } = await params;
    await requirePanelPermission(request, "guardian_communication.manage");
    const body = await request.json();
    if (String(body?.action || "").trim().toUpperCase() !== "RESOLVE_SPECIAL_NOTE") {
      throw new PanelAuthorizationError(400, "Unsupported guardian-care update.");
    }
    const { authorization, schoolClass } = await resolveScopedCommunicationClass(request, className, "guardian_communication.manage", body?.classId);
    const noteId = wholeNumber(body?.noteId, "noteId");
    const note = await prisma.guardianStudentSpecialNote.findFirst({ where: { id: noteId, classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId } });
    if (!note) throw new PanelAuthorizationError(404, "Special guardian note not found in this class.");
    const specialNote = await prisma.guardianStudentSpecialNote.update({ where: { id: note.id }, data: { isResolved: true, resolvedAt: new Date(), resolvedById: authorization.user.id } });
    await appendEnterpriseAuditEvent({ actorUserId: authorization.user.id, action: "guardian_care.special_note.resolve", resource: "GuardianStudentSpecialNote", resourceId: specialNote.id, scope: classScope(schoolClass), afterData: { studentId: specialNote.studentId, priority: specialNote.priority } });
    return NextResponse.json({ specialNote });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Guardian care workspace]", error);
    return NextResponse.json({ error: "Unable to update the special guardian note." }, { status: 500 });
  }
}
