import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// POST /api/syllabus-schedule - Create a new SyllabusScheduleDailyPlan record
export async function POST(request) {
  try {
    // Parse the request body
    const {
      classSubjectId,
      date,
      topicTitle,
      syllabusId,
      isCompleted = false,
      completionDate,
      articleLinks1,
      articleLinks2,
      videoLinks,
      videoLinks2,
      instructions_for_students,
      instructions_for_teachers,
      isHoliday = false,
      notes,
      homeworkDescription,
      homeworkDueDate,
    } = await request.json();


    // Create the new record
    const newRecord = await prisma.syllabusScheduleDailyPlan.create({
      data: {
        classSubjectId,
        date: new Date(date),
        topicTitle,
        // syllabusId,
        isCompleted,
        completionDate: completionDate ? new Date(completionDate) : null,
        articleLinks1,
        articleLinks2,
        videoLinks,
        videoLinks2,
        instructions_for_students,
        instructions_for_teachers,
        isHoliday,
        notes,
        homeworkDescription,
        homeworkDueDate: homeworkDueDate ? new Date(homeworkDueDate) : null,
      },
    });

    // Return the created record
    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating SyllabusScheduleDailyPlan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  } finally {
    // Disconnect Prisma client to avoid connection leaks
    await prisma.$disconnect();
  }
}

export async function GET() {
  try {
    const allPlans = await prisma.syllabusScheduleDailyPlan.findMany({
      orderBy: {
        date: 'asc', // You can sort by date or createdAt etc.
      },
      include: {
        subjectSyllabus: true,
        classSubject: {
          include: {
            subject: true,
            class: true,
          },
        },
      },
    });

    return NextResponse.json(allPlans);
  } catch (error) {
    console.error('Error fetching all syllabus schedule plans:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
