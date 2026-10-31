import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  positiveInteger,
  requireClassSubjectAccess,
  requireClassSubjectBatchWriteAccess,
} from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

const validSemesters = new Set(["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"]);

function scoreInRange(value, minimum, maximum) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum ? parsed : null;
}

function resultScope(classSubject) {
  return {
    schoolId: classSubject.class.schoolId,
    branchId: classSubject.class.branchId,
    classId: classSubject.class.id,
  };
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classSubjectId = positiveInteger(searchParams.get("classSubjectId"));
    const semester = searchParams.get("semester");
    if (!classSubjectId || !semester || !validSemesters.has(semester)) {
      return NextResponse.json({ error: "A valid class subject and semester are required." }, { status: 400 });
    }

    await requireClassSubjectAccess(request, "exam.read", classSubjectId);
    const results = await prisma.semesterResult.findMany({
      where: { classSubjectId, semester },
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true, rollNumber: true },
        },
        classSubject: {
          include: { subject: { select: { id: true, name: true } } },
        },
      },
    });

    return NextResponse.json({
      results: results.map((result) => ({
        id: result.id,
        studentId: result.studentId,
        student: {
          firstName: result.student.firstName,
          lastName: result.student.lastName,
          rollNumber: result.student.rollNumber || "N/A",
        },
        classSubjectId: result.classSubjectId,
        subject: result.classSubject.subject,
        classId: result.classId,
        branchId: result.branchId,
        schoolId: result.schoolId,
        subjectId: result.subjectId,
        semester: result.semester,
        semesterExamMarks: result.semesterExamMarks,
        vivaMarks: result.vivaMarks,
        internalMarks: result.internalMarks,
        totalMarks: result.totalMarks,
        remarks: result.remarks,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
      })),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET semester results failed:", error);
    return NextResponse.json({ error: "Unable to fetch semester results." }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { results } = await request.json();
    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json({ error: "A non-empty semester result list is required." }, { status: 400 });
    }

    const { authorization, classSubjects, classSubjectsById } = await requireClassSubjectBatchWriteAccess(
      request,
      "exam.manage",
      results.map((result) => result?.classSubjectId),
      { operation: "exam" },
    );
    const normalizedResults = results.map((result) => {
      const studentId = positiveInteger(result.studentId);
      const classSubjectId = positiveInteger(result.classSubjectId);
      const semesterExamMarks = scoreInRange(result.semesterExamMarks, 0, 70);
      const vivaMarks = scoreInRange(result.vivaMarks, 0, 6);
      const internalMarks = scoreInRange(result.internalMarks, 0, 24);
      const semester = result.semester;
      if (!studentId || !classSubjectId || !validSemesters.has(semester) || semesterExamMarks === null || vivaMarks === null || internalMarks === null) {
        throw new PanelAuthorizationError(400, "Each result must contain valid student, semester, and marks values.");
      }

      const classSubject = classSubjectsById.get(classSubjectId);
      if (!classSubject) {
        throw new PanelAuthorizationError(404, "Class subject not found.");
      }
      return {
        studentId,
        classSubjectId,
        classSubject,
        semester,
        semesterExamMarks,
        vivaMarks,
        internalMarks,
        totalMarks: semesterExamMarks + vivaMarks + internalMarks,
        remarks: typeof result.remarks === "string" && result.remarks.trim() ? result.remarks.trim() : null,
      };
    });

    const uniqueResultKeys = new Set(normalizedResults.map((result) => `${result.studentId}:${result.classSubjectId}:${result.semester}`));
    if (uniqueResultKeys.size !== normalizedResults.length) {
      return NextResponse.json({ error: "Each student, subject, and semester combination may be submitted only once." }, { status: 400 });
    }

    const studentIds = [...new Set(normalizedResults.map((result) => result.studentId))];
    const students = await prisma.student.findMany({
      where: { id: { in: studentIds } },
      select: { id: true, classId: true, branchId: true, schoolId: true },
    });
    const studentsById = new Map(students.map((student) => [student.id, student]));
    for (const result of normalizedResults) {
      const student = studentsById.get(result.studentId);
      const schoolClass = result.classSubject.class;
      if (!student || student.classId !== schoolClass.id || student.branchId !== schoolClass.branchId || student.schoolId !== schoolClass.schoolId) {
        return NextResponse.json({ error: "Every student must belong to the result class." }, { status: 400 });
      }
    }

    const savedResults = await prisma.$transaction(
      normalizedResults.map((result) => {
        const schoolClass = result.classSubject.class;
        return prisma.semesterResult.upsert({
          where: {
            studentId_classSubjectId_semester: {
              studentId: result.studentId,
              classSubjectId: result.classSubjectId,
              semester: result.semester,
            },
          },
          update: {
            semesterExamMarks: result.semesterExamMarks,
            vivaMarks: result.vivaMarks,
            internalMarks: result.internalMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks,
          },
          create: {
            studentId: result.studentId,
            classSubjectId: result.classSubjectId,
            classId: schoolClass.id,
            branchId: schoolClass.branchId,
            schoolId: schoolClass.schoolId,
            subjectId: result.classSubject.subjectId,
            semester: result.semester,
            semesterExamMarks: result.semesterExamMarks,
            vivaMarks: result.vivaMarks,
            internalMarks: result.internalMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks,
          },
        });
      }),
    );

    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "EXAM_SEMESTER_RESULTS_UPSERTED",
      resource: "SemesterResult",
      resourceId: classSubjects.length === 1 ? classSubjects[0].id : null,
      scope: classSubjects.length === 1 ? resultScope(classSubjects[0]) : null,
      metadata: { resultCount: normalizedResults.length, classSubjectCount: classSubjects.length },
    });

    return NextResponse.json({ results: savedResults, message: "Semester results saved successfully." }, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST semester results failed:", error);
    return NextResponse.json({ error: "Unable to save semester results." }, { status: 500 });
  }
}
