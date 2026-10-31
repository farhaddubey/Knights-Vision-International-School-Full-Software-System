import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
// POST /api/assignments - Create a new Assignment record
export async function POST(request) {
  try {
    // Parse the request body
    const {
      classSubjectId,
      title,
      description,
      dueDate,
      biWeeklySlotStart,
      biWeeklySlotEnd,
      marks,
    } = await request.json();

    // Create the new record
    const newAssignment = await prisma.assignment.create({
      data: {
        classSubjectId,
        title,
        description,
        dueDate: new Date(dueDate),
        biWeeklySlotStart: new Date(biWeeklySlotStart),
        biWeeklySlotEnd: new Date(biWeeklySlotEnd),
        marks,
      },
    });

    // Return the created record
    return NextResponse.json(newAssignment, { status: 201 });
  } catch (error) {
    console.error('Error creating Assignment:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
}