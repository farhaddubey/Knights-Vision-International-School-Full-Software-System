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
    const month = request.nextUrl.searchParams.get("month");
    if (!Number.isInteger(classSubjectId) || classSubjectId <= 0 || !/^\d{4}-\d{2}$/.test(month || "")) {
      return NextResponse.json({ error: "A valid classSubjectId and month (YYYY-MM) are required" }, { status: 400 });
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

    const [year, monthIndex] = month.split("-").map(Number);
    const startDate = new Date(Date.UTC(year, monthIndex - 1, 1));
    const endDate = new Date(Date.UTC(year, monthIndex, 1));
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

    const recordsByDate = {};
    const daysInMonth = new Date(Date.UTC(year, monthIndex, 0)).getUTCDate();
    for (let day = 1; day <= daysInMonth; day += 1) {
      const date = `${year}-${String(monthIndex).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      recordsByDate[date] = { date: new Date(`${date}T00:00:00.000Z`), status: "PENDING" };
    }
    homeworkRecords.forEach((record) => {
      recordsByDate[record.date.toISOString().slice(0, 10)] = { date: record.date, status: record.status };
    });

    return NextResponse.json({ homeworkRecords: Object.values(recordsByDate) });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student homework report", error);
    return NextResponse.json({ error: "Failed to fetch individual homework report" }, { status: 500 });
  }
}
