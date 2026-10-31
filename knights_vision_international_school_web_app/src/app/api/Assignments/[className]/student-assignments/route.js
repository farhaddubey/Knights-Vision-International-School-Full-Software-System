import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const assignmentId = parseInt(searchParams.get('assignmentId'), 10);


    if (!assignmentId) {
      return NextResponse.json({ error: 'Missing assignmentId' }, { status: 400 });
    }

    const studentAssignments = await prisma.studentAssignment.findMany({
      where: {
        assignmentId,
        assignment: {
          classSubject: {
            classId: classInfo.id,
          },
        },
      },
      include: { student: true },
    });

    return NextResponse.json({ studentAssignments }, { status: 200 });
  } catch (error) {
    console.error(`GET Assignments/${params.className}/student-assignments Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch student assignments', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const { className } = params;
    const { studentAssignments } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(studentAssignments) || studentAssignments.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty student assignments array' }, { status: 400 });
    }

    const updatedAssignments = await prisma.$transaction(
      studentAssignments.map((sa) =>
        prisma.studentAssignment.update({
          where: { id: sa.id },
          data: {
            isSubmitted: sa.isSubmitted,
            submittedAt: sa.isSubmitted ? new Date(sa.submittedAt) : null,
            marksObtained: sa.isSubmitted ? sa.marksObtained : null,
            remarks: sa.isSubmitted ? sa.remarks : null,
            qualityTag: sa.isSubmitted ? sa.qualityTag : null,
          },
        })
      )
    );

    return NextResponse.json({ studentAssignments: updatedAssignments }, { status: 200 });
  } catch (error) {
    console.error(`PUT Assignments/${params.className}/student-assignments Error:`, error.message);
    return NextResponse.json({ error: 'Failed to update student assignments', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}