import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { month } = Object.fromEntries(request.nextUrl.searchParams);
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return NextResponse.json({ error: "Invalid or missing month parameter (YYYY-MM)" }, { status: 400 });
    }

    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setUTCMonth(endDate.getUTCMonth() + 1);
    const holidays = await prisma.holidayCalendar.findMany({
      where: {
        date: { gte: startDate, lt: endDate },
      },
      select: { id: true, date: true, title: true, createdAt: true },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({
      holidays: holidays.map((holiday) => ({ ...holiday, appliesTo: "ALL" })),
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student holidays", error);
    return NextResponse.json({ error: "Failed to fetch holidays" }, { status: 500 });
  }
}
