import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const classSubjectId = searchParams.get("classSubjectId");
    const academicYear = searchParams.get("academicYear");
    const month = searchParams.get("month");

    const parsedClassSubjectId = parseInt(classSubjectId, 10);
    const parsedAcademicYear = parseInt(academicYear, 10);
    const parsedMonth = parseInt(month, 10);
    if (!Number.isInteger(parsedClassSubjectId) || !Number.isInteger(parsedAcademicYear) || parsedMonth < 1 || parsedMonth > 12) {
      return NextResponse.json({ error: 'classSubjectId, academicYear, and a valid month are required.' }, { status: 400 });
    }

    // XS runs in the January-February portion of the same academic session.
    const calendarYear = params.className?.toUpperCase() === 'XS' && parsedMonth <= 2
      ? parsedAcademicYear + 1
      : parsedAcademicYear;
    const startDate = new Date(Date.UTC(calendarYear, parsedMonth - 1, 1));
    const endDate = new Date(Date.UTC(calendarYear, parsedMonth, 1));

    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubjectId: parsedClassSubjectId,
        academicYear: parsedAcademicYear,
        examDate: { gte: startDate, lt: endDate },
      },
      orderBy: { examDate: 'asc' },
    });

    return NextResponse.json({ boardExams });
  } catch (error) {
    console.error(`GET BoardExams/${params.className}/board-exams Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch board exams', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
