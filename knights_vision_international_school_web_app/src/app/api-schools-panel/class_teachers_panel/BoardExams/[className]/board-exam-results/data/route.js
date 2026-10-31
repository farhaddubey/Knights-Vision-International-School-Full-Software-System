import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const className = params.className;
    const { classId, academicYear, month } = request.nextUrl.searchParams;

    const subjects = await prisma.classSubject.findMany({
      where: { classId: parseInt(classId) },
      include: { subject: true },
    });

    const students = await prisma.student.findMany({
      where: {
        SchoolClass: {
          some: { classId: parseInt(classId) },
        },
      },
      select: { id: true, name: true },
    });

    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubjectId: classId,
        academicYear: parseInt(academicYear),
        examDate: {
          gte: new Date(academicYear, parseInt(month) - 1, 1),
          lte: new Date(academicYear, parseInt(month), 0),
        },
      },
      include: { BoardExamResult: true },
    });

    return NextResponse.json({ subjects, students, boardExams });
  } catch (error) {
    console.error(`GET classes/${params.className}/board-exam-results/data Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch data for PDF', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}