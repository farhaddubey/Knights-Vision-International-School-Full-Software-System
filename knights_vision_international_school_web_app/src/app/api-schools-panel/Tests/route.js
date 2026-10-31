import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// POST /api/tests - Create a new Test record
export async function POST(request) {
  try {
    // Parse the request body
    const {
      title,
      classSubjectId,
      testType,
      syllabus,
      marks,
      biWeeklySlotStart,
      biWeeklySlotEnd,
    } = await request.json();

    // Create the new record
    const newTest = await prisma.test.create({
      data: {
        title,
        classSubjectId,
        testType,
        syllabus,
        marks,
        biWeeklySlotStart: new Date(biWeeklySlotStart),
        biWeeklySlotEnd: new Date(biWeeklySlotEnd),
      },
    });

    // Return the created record
    return NextResponse.json(newTest, { status: 201 });
  } catch (error) {
    console.error('Error creating Test:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
}