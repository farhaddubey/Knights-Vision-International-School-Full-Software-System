import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { semesterDateRange, normalizeSemester } from "@/src/lib/academics/semester";
import {
  positiveInteger,
  requireClassSubjectAccess,
} from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = positiveInteger(searchParams.get("studentId"));
    const classSubjectId = positiveInteger(searchParams.get("classSubjectId"));
    const semester = normalizeSemester(searchParams.get("semester"));
    if (!studentId || !classSubjectId || !semester) {
      return NextResponse.json({ error: "A valid student, class subject, and semester are required." }, { status: 400 });
    }

    const { classSubject } = await requireClassSubjectAccess(request, "exam.read", classSubjectId);
    const schoolClass = classSubject.class;
    const student = await prisma.student.findFirst({
      where: {
        id: studentId,
        classId: schoolClass.id,
        branchId: schoolClass.branchId,
        schoolId: schoolClass.schoolId,
      },
      select: { id: true },
    });
    if (!student) {
      return NextResponse.json({ error: "Student does not belong to this class subject." }, { status: 400 });
    }

    const { start, end } = semesterDateRange(semester, schoolClass.academicYear);
    const assignments = await prisma.studentAssignment.findMany({
      where: {
        studentId,
        assignment: {
          classSubjectId: classSubject.id,
          biWeeklySlotStart: { gte: start, lte: end },
        },
      },
      select: { marksObtained: true },
      orderBy: { marksObtained: "desc" },
      take: 8,
    });
    const averageMarks = assignments.length
      ? assignments.reduce((sum, assignment) => sum + (assignment.marksObtained ?? 0), 0) / assignments.length
      : 0;

    return NextResponse.json({ averageMarks });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET internal assignment marks failed:", error);
    return NextResponse.json({ error: "Unable to calculate internal marks." }, { status: 500 });
  }
}
