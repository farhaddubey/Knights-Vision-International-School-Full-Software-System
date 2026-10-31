import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { requireClassSubjectBatchWriteAccess } from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

function validDate(value: unknown) {
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
}

function requiredText(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !value.trim()) {
    throw new PanelAuthorizationError(400, `${fieldName} is required.`);
  }
  return value.trim();
}

function auditScope(classSubjects: Array<{ class: { id: number; schoolId: number; branchId: number } }>) {
  if (classSubjects.length !== 1) return null;
  const schoolClass = classSubjects[0].class;
  return { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
}

/**
 * One authoritative batch-assignment handler, intentionally reused by the
 * older /api, /api-schools-panel, and class-teacher compatibility URLs.
 */
export async function postBatchAssignments(request: Request) {
  try {
    const { assignments } = await request.json();
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json({ error: "A non-empty assignments list is required." }, { status: 400 });
    }

    const { authorization, classSubjects, classSubjectsById } = await requireClassSubjectBatchWriteAccess(
      request,
      "homework.manage",
      assignments.map((assignment) => assignment?.classSubjectId),
      { operation: "homework" },
    );

    const normalizedAssignments = assignments.map((assignment) => {
      const classSubjectId = Number(assignment.classSubjectId);
      const dueDate = validDate(assignment.dueDate);
      const biWeeklySlotStart = validDate(assignment.biWeeklySlotStart);
      const biWeeklySlotEnd = validDate(assignment.biWeeklySlotEnd);
      if (!Number.isInteger(classSubjectId) || !dueDate || !biWeeklySlotStart || !biWeeklySlotEnd) {
        throw new PanelAuthorizationError(400, "Each assignment requires valid subject and date values.");
      }
      if (biWeeklySlotEnd < biWeeklySlotStart) {
        throw new PanelAuthorizationError(400, "An assignment's bi-weekly end date must follow its start date.");
      }
      const classSubject = classSubjectsById.get(classSubjectId);
      if (!classSubject) {
        throw new PanelAuthorizationError(404, "Class subject not found.");
      }

      return {
        classSubjectId,
        classSubject,
        title: requiredText(assignment.title, "Assignment title"),
        description: requiredText(assignment.description, "Assignment description"),
        dueDate,
        biWeeklySlotStart,
        biWeeklySlotEnd,
      };
    });

    await prisma.$transaction(
      normalizedAssignments.map((assignment) => prisma.assignment.create({
        data: {
          classSubjectId: assignment.classSubjectId,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          biWeeklySlotStart: assignment.biWeeklySlotStart,
          biWeeklySlotEnd: assignment.biWeeklySlotEnd,
          SchoolClass: { connect: { id: assignment.classSubject.class.id } },
        },
      })),
    );

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "HOMEWORK_ASSIGNMENTS_CREATED",
      resource: "Assignment",
      resourceId: classSubjects.length === 1 ? classSubjects[0].id : null,
      scope: auditScope(classSubjects),
      metadata: { assignmentCount: normalizedAssignments.length, classSubjectCount: classSubjects.length },
    });

    return NextResponse.json({ message: "Batch assignments created successfully." });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST batch assignments failed:", error);
    return NextResponse.json({ error: "Unable to create batch assignments." }, { status: 500 });
  }
}

/**
 * One authoritative batch-test handler. Tests are always attached to the
 * server-resolved class subject and class, never to a class ID supplied by a
 * browser.
 */
export async function postBatchTests(request: Request) {
  try {
    const { tests } = await request.json();
    if (!Array.isArray(tests) || tests.length === 0) {
      return NextResponse.json({ error: "A non-empty tests list is required." }, { status: 400 });
    }

    const { authorization, classSubjects, classSubjectsById } = await requireClassSubjectBatchWriteAccess(
      request,
      "exam.manage",
      tests.map((test) => test?.classSubjectId),
      { operation: "exam" },
    );

    const normalizedTests = tests.map((test) => {
      const classSubjectId = Number(test.classSubjectId);
      const biWeeklySlotStart = validDate(test.biWeeklySlotStart);
      const biWeeklySlotEnd = validDate(test.biWeeklySlotEnd);
      const numericMarks = test.marks === null || test.marks === undefined || test.marks === ""
        ? null
        : Number(test.marks);
      if (
        !Number.isInteger(classSubjectId)
        || !biWeeklySlotStart
        || !biWeeklySlotEnd
        || (numericMarks !== null && (!Number.isInteger(numericMarks) || numericMarks < 0 || numericMarks > 1000))
      ) {
        throw new PanelAuthorizationError(400, "Each test requires valid subject, dates, and marks values.");
      }
      if (biWeeklySlotEnd < biWeeklySlotStart) {
        throw new PanelAuthorizationError(400, "A test's bi-weekly end date must follow its start date.");
      }
      const classSubject = classSubjectsById.get(classSubjectId);
      if (!classSubject) {
        throw new PanelAuthorizationError(404, "Class subject not found.");
      }

      return {
        classSubjectId,
        classSubject,
        title: requiredText(test.title, "Test title"),
        testType: requiredText(test.testType, "Test type"),
        syllabus: typeof test.syllabus === "string" && test.syllabus.trim() ? test.syllabus.trim() : null,
        marks: numericMarks,
        biWeeklySlotStart,
        biWeeklySlotEnd,
      };
    });

    await prisma.$transaction(
      normalizedTests.map((test) => prisma.test.create({
        data: {
          classSubjectId: test.classSubjectId,
          title: test.title,
          testType: test.testType,
          syllabus: test.syllabus,
          marks: test.marks,
          biWeeklySlotStart: test.biWeeklySlotStart,
          biWeeklySlotEnd: test.biWeeklySlotEnd,
          SchoolClass: { connect: { id: test.classSubject.class.id } },
        },
      })),
    );

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "EXAM_TESTS_CREATED",
      resource: "Test",
      resourceId: classSubjects.length === 1 ? classSubjects[0].id : null,
      scope: auditScope(classSubjects),
      metadata: { testCount: normalizedTests.length, classSubjectCount: classSubjects.length },
    });

    return NextResponse.json({ message: "Batch tests created successfully." });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST batch tests failed:", error);
    return NextResponse.json({ error: "Unable to create batch tests." }, { status: 500 });
  }
}
