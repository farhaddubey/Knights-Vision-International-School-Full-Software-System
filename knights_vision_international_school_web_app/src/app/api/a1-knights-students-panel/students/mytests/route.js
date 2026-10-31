import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { searchParams } = new URL(request.url);
    const fetchMode = searchParams.get("fetch");
    if (fetchMode === "subjects") {
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId: student.classId, branchId: student.branchId, schoolId: student.schoolId },
        select: {
          id: true,
          classId: true,
          subject: { select: { name: true } },
          teacher: { select: { username: true } },
        },
        orderBy: { id: "asc" },
      });
      return NextResponse.json({ classSubjects });
    }

    const classSubjectId = positiveInteger(searchParams.get("classSubjectId"));
    if (!classSubjectId) return NextResponse.json({ error: "A valid class subject is required." }, { status: 400 });
    const classSubject = await prisma.classSubject.findFirst({
      where: { id: classSubjectId, classId: student.classId, branchId: student.branchId, schoolId: student.schoolId },
      select: { id: true },
    });
    if (!classSubject) return NextResponse.json({ error: "Class subject not found in your class." }, { status: 404 });

    const tests = await prisma.test.findMany({
      where: { classSubjectId: classSubject.id, TestMark: { some: { studentId: student.id } } },
      select: {
        id: true,
        title: true,
        testType: true,
        syllabus: true,
        marks: true,
        biWeeklySlotStart: true,
        biWeeklySlotEnd: true,
        TestMark: {
          where: { studentId: student.id },
          select: { marks: true, maxMarks: true, remarks: true },
        },
      },
      orderBy: { biWeeklySlotStart: "asc" },
    });

    return NextResponse.json({ tests });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student tests failed:", error);
    return NextResponse.json({ error: "Unable to fetch tests." }, { status: 500 });
  }
}
