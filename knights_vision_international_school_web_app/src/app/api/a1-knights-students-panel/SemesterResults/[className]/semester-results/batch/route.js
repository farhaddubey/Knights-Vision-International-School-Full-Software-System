import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { classSubjects } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(classSubjects) || classSubjects.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty classSubjects array' }, { status: 400 });
    }

    const results = await prisma.$transaction(
      classSubjects.map(async (cs) => {
        const { classSubjectId, classId, branchId, schoolId, subjectId, semester } = cs;
        if (!classSubjectId || !classId || !branchId || !schoolId || !subjectId || !semester) {
          throw new Error('Missing required fields in classSubjects');
        }

        const students = await prisma.student.findMany({ where: { classId } });
        return prisma.$transaction(
          students.map(async (student) => {
            const avgResponse = await prisma.studentAssignment.findMany({
              where: {
                studentId: student.id,
                assignment: {
                  classSubjectId,
                  semester,
                  biWeeklySlotStart: {
                    gte: {
                      SEMESTER_I: new Date('2025-04-01'),
                      SEMESTER_II: new Date('2025-08-01'),
                      SEMESTER_III: new Date('2025-12-01'),
                    }[semester],
                    lte: {
                      SEMESTER_I: new Date('2025-07-31'),
                      SEMESTER_II: new Date('2025-11-30'),
                      SEMESTER_III: new Date('2026-03-31'),
                    }[semester],
                  },
                },
              },
              orderBy: { marksObtained: 'desc' },
              take: 8,
            });
            const avgMarks = avgResponse.length
              ? avgResponse.reduce((sum, a) => sum + (a.marksObtained || 0), 0) / avgResponse.length
              : 0;
            const internalMarks = (avgMarks / 30) * 24;

            return prisma.semesterResult.upsert({
              where: {
                studentId_classSubjectId_semester: {
                  studentId: student.id,
                  classSubjectId,
                  semester,
                },
              },
              update: {
                semesterExamMarks: 0,
                vivaMarks: 0,
                internalMarks,
                totalMarks: internalMarks,
                remarks: null,
              },
              create: {
                studentId: student.id,
                classSubjectId,
                classId,
                branchId,
                schoolId,
                subjectId,
                semester,
                semesterExamMarks: 0,
                vivaMarks: 0,
                internalMarks,
                totalMarks: internalMarks,
                remarks: null,
              },
            });
          })
        );
      })
    );

    return NextResponse.json({ results: results.flat() }, { status: 201 });
  } catch (error) {
    console.error(`POST SemesterResults/${params.className}/semester-results/batch Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create batch semester results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}