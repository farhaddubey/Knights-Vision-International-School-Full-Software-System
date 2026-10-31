import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { StudentAuthorizationError, requireStudentSession } from "@/src/lib/student/sessionAuthorization";

function studentError(error) {
  if (error instanceof StudentAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("Student homework status", error);
  return NextResponse.json({ error: "Failed to fetch homework status" }, { status: 500 });
}

export async function getOwnHomeworkStatus(request, rawClassSubjectId, requestedStudentId) {
  try {
    const { student } = await requireStudentSession(request);
    const classSubjectId = Number(rawClassSubjectId);
    const date = request.nextUrl.searchParams.get("date");
    if (!Number.isInteger(classSubjectId) || classSubjectId <= 0 || !/^\d{4}-\d{2}-\d{2}$/.test(date || "")) {
      return NextResponse.json({ error: "A valid classSubjectId and date (YYYY-MM-DD) are required" }, { status: 400 });
    }
    if (requestedStudentId && Number(requestedStudentId) !== student.id) {
      return NextResponse.json({ error: "Students may view only their own homework status" }, { status: 403 });
    }

    const classSubject = await prisma.classSubject.findFirst({
      where: {
        id: classSubjectId,
        classId: student.classId,
        schoolId: student.schoolId,
        branchId: student.branchId,
      },
      select: { subjectId: true },
    });
    if (!classSubject) {
      return NextResponse.json({ error: "Class subject not found in your current class" }, { status: 404 });
    }

    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    const homeworkRecords = await prisma.dailyHomeworkCompletion.findMany({
      where: {
        studentId: student.id,
        subjectId: classSubject.subjectId,
        schoolId: student.schoolId,
        branchId: student.branchId,
        date: { gte: start, lte: end },
      },
      include: { student: { select: { firstName: true, lastName: true } } },
    });

    return NextResponse.json({
      homeworkRecords: homeworkRecords.map((record) => ({
        studentId: record.studentId,
        studentName: `${record.student.firstName} ${record.student.lastName}`.trim(),
        status: record.status,
        date: record.date,
      })),
    });
  } catch (error) {
    return studentError(error);
  }
}

export async function rejectHomeworkStatusWrite(request) {
  try {
    await requireStudentSession(request);
    return NextResponse.json({ error: "Students cannot change homework status." }, { status: 403 });
  } catch (error) {
    return studentError(error);
  }
}
