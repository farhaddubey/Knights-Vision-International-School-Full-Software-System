import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get('classId'), 10);
    const subjectId = parseInt(searchParams.get('subjectId'), 10);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const month = parseInt(searchParams.get('month'), 10);

    const students = await prisma.student.findMany({
      where: {
        classId,
        academicYear,
        status: { in: ['ACTIVE', 'INACTIVE_WITH_DUE'] },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        admissionNumber: true,
      },
    });

    const startDate = new Date(academicYear, month - 1, 1);
    const endDate = new Date(academicYear, month, 0);

    const results = await prisma.boardExamResult.findMany({
      where: {
        classId,
        subjectId,
        academicYear,
        examDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        studentId: true,
        writtenMarks: true,
        oralMarks: true,
        totalMarks: true,
        remarks: true,
      },
    });

    return NextResponse.json({ students, results }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/classes/${params.className}/board-exam-results Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const results = await request.json();
    

    const result = await prisma.$transaction(async (prisma) => {
      const updatedResults = [];
      for (const result of results) {
        const { studentId, classSubjectId, subjectId, classId, branchId, schoolId, writtenMarks, oralMarks, totalMarks, remarks, examDate, academicYear } = result;

        if (classId !== classInfo.id) {
          throw new Error(`Invalid classId for student ${studentId}`);
        }

        const existingResult = await prisma.boardExamResult.findUnique({
          where: { studentId_classSubjectId: { studentId, classSubjectId } },
        });

        if (existingResult) {
          const updated = await prisma.boardExamResult.update({
            where: { studentId_classSubjectId: { studentId, classSubjectId } },
            data: {
              writtenMarks,
              oralMarks,
              totalMarks,
              remarks,
              examDate,
              updatedAt: new Date(),
            },
          });
          updatedResults.push(updated);
        } else {
          const created = await prisma.boardExamResult.create({
            data: {
              studentId,
              classSubjectId,
              subjectId,
              classId,
              branchId,
              schoolId,
              writtenMarks,
              oralMarks,
              totalMarks,
              remarks,
              examDate,
              academicYear,
              title: `Knights West Bengal Board Preparation Test Series`,
            },
          });
          updatedResults.push(created);
        }
      }
      return updatedResults;
    });

    return NextResponse.json({ results: result }, { status: 201 });
  } catch (error) {
    console.error(`POST /api/classes/${params.className}/board-exam-results Error:`, error.message);
    return NextResponse.json({ error: 'Failed to save results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}