import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const classSubjectId = Number(request.nextUrl.searchParams.get("classSubjectId"));
    if (!Number.isInteger(classSubjectId) || classSubjectId <= 0) {
      return NextResponse.json({ error: "Missing or invalid classSubjectId" }, { status: 400 });
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

    const year = new Date().getFullYear();
    const startDate = new Date(`${year}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${year + 1}-01-01T00:00:00.000Z`);
    const homeworkRecords = await prisma.dailyHomeworkCompletion.findMany({
      where: {
        studentId: student.id,
        subjectId: classSubject.subjectId,
        schoolId: student.schoolId,
        branchId: student.branchId,
        date: { gte: startDate, lt: endDate },
      },
      select: { date: true, status: true },
      orderBy: { date: "asc" },
    });

    const statuses = {};
    for (let month = 1; month <= 12; month += 1) {
      const daysInMonth = new Date(year, month, 0).getDate();
      for (let day = 1; day <= daysInMonth; day += 1) {
        statuses[`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`] = "PENDING";
      }
    }
    homeworkRecords.forEach((record) => {
      statuses[record.date.toISOString().slice(0, 10)] = record.status;
    });

    return NextResponse.json({ homeworkRecords: [{ studentId: student.id, statuses }] });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student homework class report", error);
    return NextResponse.json({ error: "Failed to fetch student homework report" }, { status: 500 });
  }
}
