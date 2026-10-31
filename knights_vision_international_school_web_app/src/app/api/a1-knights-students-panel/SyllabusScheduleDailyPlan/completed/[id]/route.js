import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';



export async function POST(req, { params }) {
  const { id } = params;

  try {
    // Fetch the syllabus schedule
    const syllabusSchedule = await prisma.syllabusScheduleDailyPlan.findUnique({
      where: { id: parseInt(id) },
    });

    if (!syllabusSchedule) {
      return NextResponse.json({ error: 'Syllabus schedule not found' }, { status: 404 });
    }

    if (syllabusSchedule.isCompleted) {
      return NextResponse.json({ error: 'Syllabus schedule is already marked as completed' }, { status: 400 });
    }

    // Update the syllabus schedule to mark as completed
    const updatedSchedule = await prisma.syllabusScheduleDailyPlan.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        completionDate: new Date(),
      },
    });

    return NextResponse.json({ message: 'Syllabus schedule marked as completed', data: updatedSchedule }, { status: 200 });
  } catch (error) {
    console.error('Error marking syllabus schedule as completed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}