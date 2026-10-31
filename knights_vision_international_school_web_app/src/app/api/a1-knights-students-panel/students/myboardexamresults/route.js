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
      const subjects = await prisma.classSubject.findMany({
        where: {
          classId: student.classId,
          branchId: student.branchId,
          schoolId: student.schoolId,
        },
        select: { id: true, subject: { select: { name: true } } },
        orderBy: { id: "asc" },
      });
      return NextResponse.json({ subjects });
    }

    const classSubjectId = positiveInteger(searchParams.get("classSubjectId"));
    if (!classSubjectId) return NextResponse.json({ error: "A valid class subject is required." }, { status: 400 });
    const classSubject = await prisma.classSubject.findFirst({
      where: {
        id: classSubjectId,
        classId: student.classId,
        branchId: student.branchId,
        schoolId: student.schoolId,
      },
      select: { id: true },
    });
    if (!classSubject) return NextResponse.json({ error: "Class subject not found in your class." }, { status: 404 });

    const month = searchParams.get("month");
    const academicYear = positiveInteger(searchParams.get("academicYear"));
    const boardExamWhere = { classSubjectId };
    if (month || academicYear) {
      const monthNumber = positiveInteger(month);
      if (!monthNumber || monthNumber > 12 || !academicYear) {
        return NextResponse.json({ error: "A valid month and academic year are required together." }, { status: 400 });
      }
      boardExamWhere.examDate = {
        gte: new Date(academicYear, monthNumber - 1, 1),
        lt: new Date(academicYear, monthNumber, 1),
      };
      boardExamWhere.academicYear = academicYear;
    }

    const boardExamResults = await prisma.boardExamResult.findMany({
      where: { studentId: student.id, boardExam: boardExamWhere },
      include: {
        boardExam: {
          select: { title: true, examDate: true, academicYear: true },
        },
      },
      orderBy: { boardExam: { examDate: "asc" } },
    });
    const results = boardExamResults.map((result) => ({
      id: result.id,
      title: result.boardExam.title,
      examDate: result.boardExam.examDate,
      academicYear: result.boardExam.academicYear,
      writtenMarks: result.writtenMarks,
      oralMarks: result.oralMarks,
      totalMarks: result.totalMarks,
      remarks: result.remarks,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student board exam results failed:", error);
    return NextResponse.json({ error: "Unable to fetch board exam results." }, { status: 500 });
  }
}
