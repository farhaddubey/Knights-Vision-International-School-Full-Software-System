import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

const positiveInteger = (value) => /^\d+$/.test(value || "") && Number(value) > 0;

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { fetch, classSubjectId, month } = Object.fromEntries(request.nextUrl.searchParams);

    if (fetch === "subjects") {
      const classSubjects = await prisma.classSubject.findMany({
        where: {
          classId: student.classId,
          schoolId: student.schoolId,
          branchId: student.branchId,
        },
        include: {
          subject: { select: { name: true } },
          teacher: { select: { username: true } },
        },
        orderBy: { id: "asc" },
      });

      return NextResponse.json({ classSubjects });
    }

    if (!positiveInteger(classSubjectId)) {
      return NextResponse.json({ error: "A valid classSubjectId is required" }, { status: 400 });
    }

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid or missing month parameter (YYYY-MM)" }, { status: 400 });
    }

    const scopedClassSubject = await prisma.classSubject.findFirst({
      where: {
        id: Number(classSubjectId),
        classId: student.classId,
        schoolId: student.schoolId,
        branchId: student.branchId,
      },
      select: { id: true },
    });

    if (!scopedClassSubject) {
      return NextResponse.json({ error: "Class subject not found in your current class" }, { status: 404 });
    }

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);

    const homeworkAssignments = await prisma.syllabusScheduleDailyPlan.findMany({
      where: {
        classSubjectId: scopedClassSubject.id,
        homeworkDescription: { not: null },
        date: { gte: startDate, lt: endDate },
      },
      include: {
        classSubject: { include: { subject: { select: { name: true } } } },
        subjectSyllabus: { select: { topic: true } },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({ homeworkAssignments });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }

    console.error("GET /api/a1-knights-students-panel/students/myhomework", error);
    return NextResponse.json({ error: "Failed to fetch homework assignments" }, { status: 500 });
  }
}
