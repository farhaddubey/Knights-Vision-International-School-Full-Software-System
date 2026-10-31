import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const studentId = parseInt(searchParams.get('studentId'), 10);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);
    const semester = searchParams.get('semester');

    if (!studentId || !classSubjectId || !semester) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Define semester date ranges and assignment ranges
    const semesterRanges = {
      SEMESTER_I: { start: new Date('2025-04-01'), end: new Date('2025-07-31'), assignmentRange: [1, 8] },
      SEMESTER_II: { start: new Date('2025-08-01'), end: new Date('2025-11-30'), assignmentRange: [9, 16] },
      SEMESTER_III: { start: new Date('2025-12-01'), end: new Date('2026-03-31'), assignmentRange: [17, 24] },
    };

    const { start, end, assignmentRange } = semesterRanges[semester] || {};

    if (!start || !end || !assignmentRange) {
      return NextResponse.json({ error: 'Invalid semester' }, { status: 400 });
    }

    const assignments = await prisma.studentAssignment.findMany({
      where: {
        studentId,
        assignment: {
          classSubjectId,
          biWeeklySlotStart: { gte: start, lte: end },
        },
      },
      orderBy: { marksObtained: 'desc' },
      take: 8, // Select top 8 assignments
    });

    const averageMarks = assignments.length
      ? assignments.reduce((sum, a) => sum + (a.marksObtained || 0), 0) / assignments.length
      : 0;

    return NextResponse.json({ averageMarks }, { status: 200 });
  } catch (error) {
    console.error(`GET SemesterResults/${params.className}/student-assignments/average Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch average marks', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}