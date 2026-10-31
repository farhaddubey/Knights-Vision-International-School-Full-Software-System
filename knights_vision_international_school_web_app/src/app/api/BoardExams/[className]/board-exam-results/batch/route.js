import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function POST(request, { params }) {
  try {

    const className = params.className;
    const { results } = await request.json();

    if (!Array.isArray(results) || results.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid results array' },
        { status: 400 }
      );
    }

    const boardExamId = results[0].boardExamId;
    const existingBoardExam = await prisma.boardExam.findUnique({
      where: { id: boardExamId },
    });
    if (!existingBoardExam) {
      return NextResponse.json(
        { error: 'Board exam not found' },
        { status: 404 }
      );
    }

    const studentIds = results.map((r) => r.studentId);
    const uniqueStudentIds = [...new Set(studentIds)];
    const existingStudents = await prisma.student.findMany({
      where: { id: { in: uniqueStudentIds } },
    });
    if (existingStudents.length !== uniqueStudentIds.length) {
      return NextResponse.json(
        { error: 'One or more students not found' },
        { status: 404 }
      );
    }

    const createOrUpdatePromises = results.map(async (result) => {
      const existingResult = await prisma.boardExamResult.findUnique({
        where: {
          studentId_boardExamId: {
            studentId: result.studentId,
            boardExamId: result.boardExamId,
          },
        },
      });

      if (existingResult) {
        return prisma.boardExamResult.update({
          where: {
            studentId_boardExamId: {
              studentId: result.studentId,
              boardExamId: result.boardExamId,
            },
          },
          data: {
            writtenMarks: result.writtenMarks,
            oralMarks: result.oralMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks || null,
            updatedAt: new Date(),
          },
        });
      } else {
        return prisma.boardExamResult.create({
          data: {
            boardExamId: result.boardExamId,
            studentId: result.studentId,
            writtenMarks: result.writtenMarks,
            oralMarks: result.oralMarks,
            totalMarks: result.totalMarks,
            remarks: result.remarks || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      }
    });

    await Promise.all(createOrUpdatePromises);

    return NextResponse.json(
      { message: 'Batch board exam results saved successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`POST BoardExams/${params.className}/board-exam-results/batch Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to save batch board exam results', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}