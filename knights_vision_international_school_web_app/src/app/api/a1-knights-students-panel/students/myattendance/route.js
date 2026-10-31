import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const month = new URL(request.url).searchParams.get("month");
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "A valid month (YYYY-MM) is required." }, { status: 400 });
    }

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    const [attendanceRecords, holidays] = await Promise.all([
      prisma.attendance.findMany({
        where: { studentId: student.id, date: { gte: startDate, lt: endDate } },
        select: { date: true, status: true },
      }),
      prisma.holidayCalendar.findMany({
        where: { date: { gte: startDate, lt: endDate } },
        select: { date: true, title: true },
      }),
    ]);

    const holidayRecords = holidays.map((holiday) => ({ ...holiday, status: "HOLIDAY" }));
    const combinedRecords = [...attendanceRecords, ...holidayRecords]
      .sort((left, right) => new Date(left.date).getTime() - new Date(right.date).getTime());

    return NextResponse.json({ attendanceRecords: combinedRecords, holidays: holidayRecords });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student attendance failed:", error);
    return NextResponse.json({ error: "Unable to fetch attendance data." }, { status: 500 });
  }
}
