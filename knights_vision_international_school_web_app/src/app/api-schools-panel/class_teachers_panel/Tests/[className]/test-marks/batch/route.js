import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  positiveInteger,
  requireTestWriteAccess,
} from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

function parsedMark(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsedMaximum(value) {
  const parsed = Number(value ?? 30);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= 1000 ? parsed : null;
}

export async function POST(request) {
  try {
    const { testId, testMarks } = await request.json();
    if (!Array.isArray(testMarks) || testMarks.length === 0) {
      return NextResponse.json({ error: "A non-empty test marks list is required." }, { status: 400 });
    }

    const { authorization, test, scope } = await requireTestWriteAccess(request, testId);
    const normalizedMarks = testMarks.map((testMark) => {
      const studentId = positiveInteger(testMark.studentId);
      const marks = parsedMark(testMark.marks);
      const maxMarks = parsedMaximum(testMark.maxMarks);
      if (!studentId || !maxMarks || (testMark.marks !== null && testMark.marks !== undefined && testMark.marks !== "" && marks === null)) {
        throw new PanelAuthorizationError(400, "Each test mark must contain a valid student, marks, and maximum marks.");
      }
      if (marks !== null && (marks < 0 || marks > maxMarks)) {
        throw new PanelAuthorizationError(400, "Marks must be between zero and the maximum marks.");
      }

      return {
        studentId,
        marks,
        maxMarks,
        remarks: typeof testMark.remarks === "string" && testMark.remarks.trim()
          ? testMark.remarks.trim()
          : null,
      };
    });

    const uniqueStudentIds = [...new Set(normalizedMarks.map((testMark) => testMark.studentId))];
    if (uniqueStudentIds.length !== normalizedMarks.length) {
      return NextResponse.json({ error: "Each student may be submitted only once." }, { status: 400 });
    }

    const validStudents = await prisma.student.findMany({
      where: {
        id: { in: uniqueStudentIds },
        classId: test.classSubject.classId,
        branchId: test.classSubject.class.branchId,
        schoolId: test.classSubject.class.schoolId,
      },
      select: { id: true },
    });
    if (validStudents.length !== uniqueStudentIds.length) {
      return NextResponse.json({ error: "Every student must belong to this test's class." }, { status: 400 });
    }

    // A blank score means "not recorded yet". The schema does not permit a
    // null TestMark value, so blank entries intentionally leave existing data
    // untouched instead of creating an invalid result.
    const recordedMarks = normalizedMarks.filter((testMark) => testMark.marks !== null);
    await prisma.$transaction(
      recordedMarks.map((testMark) => prisma.testMark.upsert({
        where: {
          studentId_testId: {
            studentId: testMark.studentId,
            testId: test.id,
          },
        },
        update: {
          marks: testMark.marks,
          maxMarks: testMark.maxMarks,
          remarks: testMark.remarks,
        },
        create: {
          studentId: testMark.studentId,
          testId: test.id,
          marks: testMark.marks,
          maxMarks: testMark.maxMarks,
          remarks: testMark.remarks,
        },
      })),
    );

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "EXAM_TEST_MARKS_UPSERTED",
      resource: "Test",
      resourceId: test.id,
      scope,
      metadata: { recordedStudentCount: recordedMarks.length, submittedStudentCount: normalizedMarks.length },
    });

    return NextResponse.json({
      message: "Test marks saved successfully.",
      recordedStudentCount: recordedMarks.length,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST test marks batch failed:", error);
    return NextResponse.json({ error: "Unable to save test marks." }, { status: 500 });
  }
}
