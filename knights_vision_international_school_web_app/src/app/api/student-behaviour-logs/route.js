import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';

    const whereClause = {
      OR: [
        { student: { firstName: { contains: searchQuery, mode: 'insensitive' } } },
        { type: { contains: searchQuery, mode: 'insensitive' } },
      ],
    };

    const [logs, total] = await Promise.all([
      prisma.studentBehaviourLog.findMany({
        where: whereClause,
        include: {
          student: { select: { id: true, firstName: true, middleName: true, lastName: true } },
          classSubject: { select: { id: true, subject: { select: { name: true } } } },
          punishment: { select: { id: true, title: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { incidentDate: 'desc' },
      }),
      prisma.studentBehaviourLog.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ behaviourLogs: logs, totalPages }, { status: 200 });
  } catch (error) {
    console.error('GET Student Behaviour Logs Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch behaviour logs', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const data = await request.json();

    const log = await prisma.studentBehaviourLog.create({
      data: {
        studentId: data.studentId,
        classSubjectId: data.classSubjectId,
        category: data.category,
        type: data.type,
        description: data.description || null,
        severityLevel: data.severityLevel,
        punishmentId: data.punishmentId,
        isResolved: data.isResolved,
        resolvedBy: data.resolvedBy,
        resolvedNote: data.resolvedNote,
      },
      include: {
        student: { select: { id: true, firstName: true, lastName: true, middleName: true } },
        classSubject: { select: { id: true, subject: { select: { name: true } } } },
        punishment: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('POST Student Behaviour Log Error:', error.message);
    return NextResponse.json({ error: 'Failed to create behaviour log', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}