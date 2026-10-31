import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
  const subjectId = parseInt(params.subjectId, 10);

  if (isNaN(subjectId)) {
    return new Response(JSON.stringify({ error: 'Invalid subjectId in URL' }), { status: 400 });
  }

  console.log('✅ Subject ID from URL path:', subjectId); // logs: 10 if URL is /.../subject-syllabus/10

    const schedules = await prisma.syllabusScheduleDailyPlan.findMany({
      where: {
        classSubjectId: subjectId,
      },
      include: {
        classSubject: {
          include: { subject: true },
        },
        subjectSyllabus: true,
      },
      orderBy: { date: 'asc' },
    });

    const formattedSchedules = schedules.map((s) => ({
      ...s,
      date: s.date.toISOString(),
      completionDate: s.completionDate ? s.completionDate.toISOString() : null,
      homeworkDueDate: s.homeworkDueDate ? s.homeworkDueDate.toISOString() : null,
    }));

    return NextResponse.json({ schedules: formattedSchedules }, { status: 200 });
  } catch (error) {
    console.error(`GET SyllabusScheduleDailyPlan/${params.className}/syllabus-schedule Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch schedules', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { schedules } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty schedules array' }, { status: 400 });
    }
    const createdSchedules = await prisma.$transaction(
      schedules.map((s) =>
        prisma.syllabusScheduleDailyPlan.create({
          data: {
            classSubjectId: s.classSubjectId,
            date: new Date(s.date),
            topicTitle: s.topicTitle,
            syllabusId: s.syllabusId,
            isCompleted: s.isCompleted,
            completionDate: s.isCompleted ? new Date() : null,
            articleLinks1: s.articleLinks1,
            articleLinks2: s.articleLinks2,
            videoLinks: s.videoLinks,
            videoLinks2: s.videoLinks2,
            instructions_for_students: s.instructions_for_students,
            instructions_for_teachers: s.instructions_for_teachers,
            notes: s.notes,
            isHoliday: s.isHoliday,
            homeworkDescription: s.homeworkDescription,
            homeworkDueDate: s.homeworkDueDate ? new Date(s.homeworkDueDate) : null,
          },
        })
      )
    );

    return NextResponse.json({ schedules: createdSchedules }, { status: 201 });
  } catch (error) {
    console.error(`POST SyllabusScheduleDailyPlan/${params.className}/syllabus-schedule Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create schedules', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}