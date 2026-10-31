import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';


export async function GET(request, { params }) {
  try {
    const className = params.className;

    if (!classMap[className.toLowerCase()]) {
      return NextResponse.json({ error: `Invalid class name: ${className}` }, { status: 400 });
    }

    const searchParams = request.nextUrl.searchParams;
    const classSubjectId = searchParams.get("classSubjectId");
    const academicYear = searchParams.get("academicYear");
    const month = searchParams.get("month");

    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubjectId: parseInt(classSubjectId),
        academicYear: parseInt(academicYear),
        // If needed later:
        // examDate: {
        //   gte: new Date(parseInt(academicYear), parseInt(month) - 1, 1),
        //   lte: new Date(parseInt(academicYear), parseInt(month), 0),
        // },
      },
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
