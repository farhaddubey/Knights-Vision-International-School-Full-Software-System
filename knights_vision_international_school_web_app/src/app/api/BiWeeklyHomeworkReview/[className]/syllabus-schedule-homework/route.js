import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!classSubjectId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const schedules = await prisma.syllabusScheduleDailyPlan.findMany({
      where: {
        classSubjectId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        homeworkDescription: { not: null },
        classSubject: {
          classId: classInfo.id,
        },
      },
      select: {
        id: true,
        date: true,
        homeworkDescription: true,
        homeworkDueDate: true,
      },
      orderBy: { date: 'asc' },
    });

    const formattedSchedules = schedules.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      homeworkDueDate: s.homeworkDueDate ? s.homeworkDueDate.toISOString() : null,
    }));

    return NextResponse.json({ schedules: formattedSchedules }, { status: 200 });
  } catch (error) {
    console.error(`GET BiWeeklyHomeworkReview/${params.className}/syllabus-schedule-homework Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch homework data', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}