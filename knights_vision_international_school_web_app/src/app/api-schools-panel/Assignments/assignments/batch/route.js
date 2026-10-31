import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; 

export async function POST(request, { params }) {
  try {
    const className = params.className;
    const { assignments } = await request.json();

    // Validate className against classMap
    if (!classMap[className.toLowerCase()]) {
      return NextResponse.json({ error: `Invalid class name: ${className}` }, { status: 400 });
    }

    // Validate payload
    if (!Array.isArray(assignments) || assignments.length === 0) {
      return NextResponse.json(
        { error: 'Missing or invalid assignments array' },
        { status: 400 }
      );
    }

    // Validate classSubjectId exists
    const classSubjectIds = assignments.map((a) => a.classSubjectId);
    const uniqueClassSubjectIds = [...new Set(classSubjectIds)];
    const existingClassSubjects = await prisma.classSubject.findMany({
      where: { id: { in: uniqueClassSubjectIds } },
    });
    if (existingClassSubjects.length !== uniqueClassSubjectIds.length) {
      return NextResponse.json(
        { error: 'One or more class subjects not found' },
        { status: 404 }
      );
    }

    // Get classId from the first classSubject (all assignments use the same classId)
    const classId = existingClassSubjects[0].classId;

    // Batch create Assignment records
    const createPromises = assignments.map(async (assignment) => {
      return prisma.assignment.create({
        data: {
          classSubjectId: assignment.classSubjectId,
          title: assignment.title,
          description: assignment.description,
          dueDate: new Date(assignment.dueDate),
          biWeeklySlotStart: new Date(assignment.biWeeklySlotStart),
          biWeeklySlotEnd: new Date(assignment.biWeeklySlotEnd),
          createdAt: new Date(),
          updatedAt: new Date(),
          SchoolClass: {
            connect: { id: classId },
          },
        },
      });
    });

    await Promise.all(createPromises);

    return NextResponse.json(
      { message: 'Batch assignments created successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`POST Assignments/${params.className}/assignments/batch Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to create batch assignments', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}