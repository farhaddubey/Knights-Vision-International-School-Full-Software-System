import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get('classId'), 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo || classId !== classInfo.id) {
      return NextResponse.json({ error: 'Invalid class name or classId' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: {
        classId,
        academicYear,
        status: { in: ['ACTIVE', 'INACTIVE_WITH_DUE'] },
      },
      include: {
        class: { select: { name: true, section: true } },
        feeScheme: { select: { monthlyFee: true } },
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const total = await prisma.student.count({
      where: {
        classId,
        academicYear,
        status: { in: ['ACTIVE', 'INACTIVE_WITH_DUE'] },
      },
    });

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ students, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/classes/${params.className}/students/eligible-for-tc Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch eligible students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}