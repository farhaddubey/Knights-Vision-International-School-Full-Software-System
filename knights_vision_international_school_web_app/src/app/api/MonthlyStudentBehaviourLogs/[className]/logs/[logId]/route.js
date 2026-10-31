import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className, logId } = params;

    const log = await prisma.studentBehaviourLog.findUnique({
      where: { id: parseInt(logId) },
      include: {
        student: { select: { id: true, name: true, classId: true } },
        classSubject: { select: { id: true, subject: { select: { name: true } } } },
        punishment: { select: { id: true, title: true } },
      },
    });

    if (!log) {
      return NextResponse.json({ error: 'Behaviour log not found' }, { status: 404 });
    }

    if (log.student.classId !== classInfo.id) {
      return NextResponse.json({ error: 'Behaviour log does not belong to the specified class' }, { status: 400 });
    }

    return NextResponse.json(log, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyStudentBehaviourLogs/${params.className}/logs/${params.logId} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch behaviour log', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}