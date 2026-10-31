import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

const semesters = ["SEMESTER_I", "SEMESTER_II", "SEMESTER_III"];

/**
 * Personal result-card data for the signed-in student only.
 *
 * This deliberately does not accept school, branch, class, roll number, or
 * student ID query parameters.  Those values are derived from the live
 * student session to prevent cross-student result lookup from mobile clients.
 */
export async function GET(request) {
  try {
    const { student: sessionStudent } = await requireStudentSession(request);
    const scope = {
      classId: sessionStudent.classId,
      branchId: sessionStudent.branchId,
      schoolId: sessionStudent.schoolId,
    };

    const [student, classSubjects, results] = await Promise.all([
      prisma.student.findUnique({
        where: { id: sessionStudent.id },
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          admissionNumber: true,
          rollNumber: true,
          class: { select: { id: true, name: true, section: true } },
          branch: { select: { id: true, name: true } },
        },
      }),
      prisma.classSubject.findMany({
        where: scope,
        select: {
          id: true,
          subjectId: true,
          subject: { select: { id: true, name: true } },
        },
        orderBy: { id: "asc" },
      }),
      prisma.semesterResult.findMany({
        where: { studentId: sessionStudent.id, ...scope, semester: { in: semesters } },
        select: {
          id: true,
          classSubjectId: true,
          subjectId: true,
          semester: true,
          semesterExamMarks: true,
          vivaMarks: true,
          internalMarks: true,
          totalMarks: true,
          remarks: true,
        },
        orderBy: [{ semester: "asc" }, { classSubjectId: "asc" }],
      }),
    ]);

    if (!student) {
      return NextResponse.json({ error: "Student account was not found." }, { status: 404 });
    }

    return NextResponse.json({
      student,
      classSubjects: classSubjects.map((entry) => ({
        id: entry.id,
        subjectId: entry.subjectId,
        subject: entry.subject,
      })),
      resultsBySemester: semesters.map((semester) => ({
        semester,
        results: results.filter((result) => result.semester === semester),
      })),
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student semester results failed:", error);
    return NextResponse.json({ error: "Unable to fetch your semester results." }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
