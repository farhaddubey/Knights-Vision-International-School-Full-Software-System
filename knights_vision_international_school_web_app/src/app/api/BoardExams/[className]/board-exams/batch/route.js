import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function POST(request, { params }) {
  try {
    const className = params.className; // params is directly accessible in App Router
    const { boardExams } = await request.json();
    if (!Array.isArray(boardExams) || boardExams.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid board exams array' },
        { status: 400 }
      );
    }

    console.log("Board Exams are", boardExams);

    const createPromises = boardExams.map(async (exam) => {
      return prisma.boardExam.create({
        data: {
          classSubjectId: exam.classSubjectId,
          title: exam.title,
          syllabus: exam.syllabus || null,
          examDate: new Date(exam.examDate),
          totalMarks: exam.totalMarks,
          academicYear: exam.academicYear,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    });

    await Promise.all(createPromises);

    return NextResponse.json(
      { message: 'Batch board exams created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`POST BoardExams/${params.className}/board-exams/batch Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to create batch board exams', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}