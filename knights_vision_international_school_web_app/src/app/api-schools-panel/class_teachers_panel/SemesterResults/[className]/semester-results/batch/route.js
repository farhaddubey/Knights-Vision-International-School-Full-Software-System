import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import { calculateInternalMarks, normalizeSemester, semesterDateRange } from "@/src/lib/academics/semester";
import { requireClassSubjectBatchWriteAccess } from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

export async function POST(request) {
  try {
    const { classSubjects } = await request.json();
    if (!Array.isArray(classSubjects) || classSubjects.length === 0) {
      return NextResponse.json({ error: "A non-empty class subjects list is required." }, { status: 400 });
    }

    const { authorization, classSubjects: canonicalSubjects, classSubjectsById } = await requireClassSubjectBatchWriteAccess(
      request,
      "exam.manage",
      classSubjects.map((classSubject) => classSubject?.classSubjectId),
      { operation: "exam" },
    );

    const requestedSubjects = classSubjects.map((requestedSubject) => {
      const classSubjectId = Number(requestedSubject.classSubjectId);
      const classSubject = classSubjectsById.get(classSubjectId);
      const semester = normalizeSemester(requestedSubject.semester);
      if (!classSubject || !semester) {
        throw new PanelAuthorizationError(400, "Each item must contain a valid class subject and semester.");
      }
      return { classSubject, semester };
    });

    const upserts = [];
    for (const { classSubject, semester } of requestedSubjects) {
      const schoolClass = classSubject.class;
      const students = await prisma.student.findMany({
        where: {
          classId: schoolClass.id,
          branchId: schoolClass.branchId,
          schoolId: schoolClass.schoolId,
        },
        select: { id: true },
      });
      const studentIds = students.map((student) => student.id);
      const { start, end } = semesterDateRange(semester, schoolClass.academicYear);
      const markedAssignments = studentIds.length === 0
        ? []
        : await prisma.studentAssignment.findMany({
            where: {
              studentId: { in: studentIds },
              assignment: {
                classSubjectId: classSubject.id,
                biWeeklySlotStart: { gte: start, lte: end },
              },
            },
            select: { studentId: true, marksObtained: true },
          });
      const marksByStudent = new Map();
      for (const markedAssignment of markedAssignments) {
        const marks = marksByStudent.get(markedAssignment.studentId) ?? [];
        marks.push(markedAssignment.marksObtained ?? 0);
        marksByStudent.set(markedAssignment.studentId, marks);
      }

      for (const student of students) {
        const bestMarks = (marksByStudent.get(student.id) ?? []).sort((left, right) => right - left).slice(0, 8);
        const averageMarks = bestMarks.length
          ? bestMarks.reduce((sum, marks) => sum + marks, 0) / bestMarks.length
          : 0;
        const internalMarks = calculateInternalMarks(averageMarks);
        upserts.push(prisma.semesterResult.upsert({
          where: {
            studentId_classSubjectId_semester: {
              studentId: student.id,
              classSubjectId: classSubject.id,
              semester,
            },
          },
          // Batch initialization must never erase marks that an authorized
          // teacher or examination controller has already entered.
          update: {},
          create: {
            studentId: student.id,
            classSubjectId: classSubject.id,
            classId: schoolClass.id,
            branchId: schoolClass.branchId,
            schoolId: schoolClass.schoolId,
            subjectId: classSubject.subjectId,
            semester,
            semesterExamMarks: 0,
            vivaMarks: 0,
            internalMarks,
            totalMarks: internalMarks,
            remarks: null,
          },
        }));
      }
    }

    const results = upserts.length ? await prisma.$transaction(upserts) : [];
    const onlySubject = canonicalSubjects.length === 1 ? canonicalSubjects[0] : null;
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "EXAM_SEMESTER_RESULTS_INITIALIZED",
      resource: "SemesterResult",
      resourceId: onlySubject?.id ?? null,
      scope: onlySubject
        ? { schoolId: onlySubject.class.schoolId, branchId: onlySubject.class.branchId, classId: onlySubject.class.id }
        : null,
      metadata: { resultCount: results.length, classSubjectCount: canonicalSubjects.length },
    });

    return NextResponse.json({ results }, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST batch semester results failed:", error);
    return NextResponse.json({ error: "Unable to initialize semester results." }, { status: 500 });
  }
}
