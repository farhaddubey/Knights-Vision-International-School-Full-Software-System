import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';

export async function POST(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { schoolId, branchId } = jwt.verify(token, process.env.JWT_SECRET);
    const schedules = await request.json();

    if (!Array.isArray(schedules) || schedules.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty schedules array' }, { status: 400 });
    }

    const errors = [];
    const createdSchedules = [];

    for (const schedule of schedules) {
      const { classSubjectId, semester, examDate, durationMinutes, examHall } = schedule;

      if (!classSubjectId || !semester || !examDate || !durationMinutes) {
        errors.push(`Missing required fields for schedule: ${JSON.stringify(schedule)}`);
        continue;
      }

      const classSubject = await prisma.classSubject.findUnique({
        where: { id: classSubjectId, schoolId, branchId },
        select: { classId: true, subjectId: true },
      });

      if (!classSubject) {
        errors.push(`Invalid classSubjectId: ${classSubjectId}`);
        continue;
      }

      const existingSchedule = await prisma.semesterExamSchedule.findFirst({
        where: { classSubjectId, semester, schoolId, branchId },
      });

      if (existingSchedule) {
        errors.push(`Schedule already exists for classSubjectId: ${classSubjectId}, semester: ${semester}`);
        continue;
      }

      const newSchedule = await prisma.semesterExamSchedule.create({
        data: {
          classSubjectId,
          classId: classSubject.classId,
          subjectId: classSubject.subjectId,
          branchId,
          schoolId,
          semester,
          examDate: new Date(examDate),
          durationMinutes: parseInt(durationMinutes),
          examHall: examHall || null,
        },
      });

      createdSchedules.push(newSchedule);
    }

    if (errors.length > 0) {
      return NextResponse.json({ message: 'Some schedules could not be created', errors, createdSchedules }, { status: 207 });
    }

    return NextResponse.json({ schedules: createdSchedules }, { status: 201 });
  } catch (error) {
    console.error('POST /api/semester-exam-schedules/batch Error:', error.message);
    return NextResponse.json({ error: 'Failed to create schedules', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
