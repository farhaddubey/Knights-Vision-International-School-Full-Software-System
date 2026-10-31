import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Validate academicYear
    if (!academicYear || isNaN(academicYear)) {
      return NextResponse.json({ error: 'Invalid academic year' }, { status: 400 });
    }

    const whereClause = {
      student: {
        class: {
          name: className.toUpperCase(),
          branchId,
          academicYear,
        },
      },
      OR: searchQuery
        ? [
            // Uncomment if student name search is needed
            // {
            //   student: {
            //     OR: [
            //       { firstName: { contains: searchQuery, mode: 'insensitive' } },
            //       { middleName: { contains: searchQuery, mode: 'insensitive' } },
            //       { lastName: { contains: searchQuery, mode: 'insensitive' } },
            //     ],
            //   },
            // },
            { type: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
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
    console.error(`GET MonthlyStudentBehaviourLogs/${params.className}/logs Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch behaviour logs', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const data = await request.json();

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    // Validate student belongs to the specified class
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      select: { class: { select: { name: true, branchId: true, academicYear: true } } },
    });
    if (!student || student.class.name !== className.toUpperCase() || student.class.branchId !== (data.branchId || 1) || student.class.academicYear !== (data.academicYear || academicYear)) {
      return NextResponse.json({ error: 'Student does not belong to the specified class' }, { status: 400 });
    }

    const log = await prisma.studentBehaviourLog.create({
      data: {
        studentId: data.studentId,
        classSubjectId: data.classSubjectId || null,
        class: {
          connect: {
            name_branchId_academicYear: {
              name: className.toUpperCase(),
              branchId: data.branchId || 1,
              academicYear: data.academicYear || academicYear,
            },
          },
        },
        category: data.category,
        type: data.type,
        description: data.description || null,
        severityLevel: data.severityLevel,
        punishmentId: data.punishmentId || null,
        isResolved: data.isResolved,
        resolvedBy: data.resolvedBy || null,
        resolvedNote: data.resolvedNote || null,
      },
      include: {
        student: { select: { id: true, firstName: true, middleName: true, lastName: true } },
        classSubject: { select: { id: true, subject: { select: { name: true } } } },
        punishment: { select: { id: true, title: true } },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error(`POST MonthlyStudentBehaviourLogs/${params.className}/logs Error:`, error);
    return NextResponse.json({ error: 'Failed to create behaviour log', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
