import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; 

export async function POST(request, { params }) {
  try {
    const { assignmentId, studentAssignments } = await request.json();


    if (!assignmentId || !Array.isArray(studentAssignments)) {
      return NextResponse.json({ error: 'Missing or invalid assignmentId or studentAssignments' }, { status: 400 });
    }

    // Validate assignment exists
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(assignmentId) },
    });
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    // Batch create or update StudentAssignment records
    const upsertPromises = studentAssignments.map(async (sa) => {
      return prisma.studentAssignment.upsert({
        where: {
          studentId_assignmentId: {
            studentId: sa.studentId,
            assignmentId: parseInt(assignmentId),
          },
        },
        update: {
          isSubmitted: sa.isSubmitted,
          marksObtained: sa.marksObtained ? parseFloat(sa.marksObtained) : null,
          remarks: sa.remarks,
          qualityTag: sa.qualityTag,
          submittedAt: sa.isSubmitted ? new Date() : null,
          updatedAt: new Date(),
        },
        create: {
          studentId: sa.studentId,
          assignmentId: parseInt(assignmentId),
          isSubmitted: sa.isSubmitted,
          marksObtained: sa.marksObtained ? parseFloat(sa.marksObtained) : null,
          remarks: sa.remarks,
          qualityTag: sa.qualityTag,
          submittedAt: sa.isSubmitted ? new Date() : null,
        },
      });
    });

    await Promise.all(upsertPromises);

    return NextResponse.json({ message: 'Student assignments updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`POST BiWeeklyAssignments/${params.className}/student-assignments/batch Error:`, error.message);
    return NextResponse.json({ error: 'Failed to update student assignments', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}