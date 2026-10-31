import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// Get all Board Exams
export async function GET() {
  const exams = await prisma.boardExam.findMany({
    include: {
      classSubject: true,
      BoardExamResult: true,
    },
    orderBy: {
      examDate: "desc",
    },
  });

  return NextResponse.json(exams);
}

// Create new Board Exam
export async function POST(req: Request) {
  const data = await req.json();

  try {
    const newExam = await prisma.boardExam.create({
      data: {
        title: data.title,
        classSubjectId: data.classSubjectId,
        examDate: new Date(data.examDate),
        totalMarks: data.totalMarks ?? 100,
        syllabus: data.syllabus ?? null,
        academicYear: data.academicYear ?? 2025,
      },
    });

    return NextResponse.json(newExam);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create Board Exam", detail: error }, { status: 500 });
  }
}
