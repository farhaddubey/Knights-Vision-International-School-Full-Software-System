import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function POST(req, { params }) {
  const { id } = params;
  const token = req.headers.get('authorization')?.replace('Bearer ', '');

  if (!token) {
    return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
  }

  try {
    // Fetch the syllabus topic
    const syllabusTopic = await prisma.subjectSyllabus.findUnique({
      where: { id: parseInt(id) },
    });

    if (!syllabusTopic) {
      return NextResponse.json({ error: 'Syllabus topic not found' }, { status: 404 });
    }

    if (syllabusTopic.isCompleted) {
      return NextResponse.json({ error: 'Syllabus topic is already marked as completed' }, { status: 400 });
    }

    // Update the syllabus topic to mark as completed
    const updatedTopic = await prisma.subjectSyllabus.update({
      where: { id: parseInt(id) },
      data: {
        isCompleted: true,
        completionDate: new Date(),
      },
    });

    return NextResponse.json({ message: 'Syllabus topic marked as completed', data: updatedTopic }, { status: 200 });
  } catch (error) {
    console.error('Error marking syllabus topic as completed:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}