import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);

    if (!classSubjectId) {
      return NextResponse.json({ error: 'Missing classSubjectId' }, { status: 400 });
    }

    const tests = await prisma.test.findMany({
      where: {
        classSubjectId,
      },
      include: {
        classSubject: { include: { subject: true } },
        TestMark: { include: { student: true } },
      },
      orderBy: { biWeeklySlotStart: 'desc' },
    });

    const formattedTests = tests.map((t) => ({
      ...t,
      biWeeklySlotStart: t.biWeeklySlotStart.toISOString(),
      biWeeklySlotEnd: t.biWeeklySlotEnd.toISOString(),
    }));

    return NextResponse.json({ tests: formattedTests }, { status: 200 });
  } catch (error) {
    console.error(`GET Tests/${params.className}/tests Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch tests', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const body = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { classSubjectId, classId, branchId, schoolId, subjectId, title, testType, syllabus, biWeeklySlotStart, biWeeklySlotEnd } = body;

    if (!classSubjectId || !classId || !branchId || !schoolId || !subjectId || !title || !syllabus || !biWeeklySlotStart || !biWeeklySlotEnd) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const students = await prisma.student.findMany({ where: { classId } });

    const test = await prisma.test.create({
      data: {
        classSubjectId,
        classId,
        branchId,
        schoolId,
        subjectId,
        title,
        testType,
        syllabus,
        biWeeklySlotStart: new Date(biWeeklySlotStart),
        biWeeklySlotEnd: new Date(biWeeklySlotEnd),
        TestMark: {
          create: students.map((student) => ({
            studentId: student.id,
            maxMarks: 30,
            marks: null,
          })),
        },
      },
      include: { TestMark: true },
    });

    return NextResponse.json({ test }, { status: 201 });
  } catch (error) {
    console.error(`POST Tests/${params.className}/tests Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create test', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}