import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function POST(req) {
  try {
    // // Extract token from Authorization header
    // const token = req.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return NextResponse.json({ error: 'User not authenticated' }, { status: 401 });
    // }

    // Parse request body
    const body = await req.json();
    const { subjectId, topic, lectureContent } = body;

    // Validate required fields
    if (!subjectId || !topic) {
      return NextResponse.json({ error: 'subjectId and topic are required' }, { status: 400 });
    }

    // // Validate subjectId exists
    // const subjectExists = await prisma.classSubject.findUnique({
    //   where: { id: parseInt(subjectId) },
    // });

    // if (!subjectExists) {
    //   return NextResponse.json({ error: 'Invalid subjectId' }, { status: 404 });
    // }

    // Validate topic length
    if (topic.length > 200) {
      return NextResponse.json({ error: 'Topic must be 200 characters or less' }, { status: 400 });
    }

    // Create new SubjectSyllabus record
    const newSyllabusTopic = await prisma.subjectSyllabus.create({
      data: {
        subjectId: parseInt(subjectId),
        topic,
        lectureContent,
        isCompleted: false,
      },
    });

    return NextResponse.json(
      { message: 'Syllabus topic created successfully', data: newSyllabusTopic },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating syllabus topic:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}