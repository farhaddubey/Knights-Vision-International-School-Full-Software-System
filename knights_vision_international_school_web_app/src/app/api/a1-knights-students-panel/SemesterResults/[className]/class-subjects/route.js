import { NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const branchId = parseInt(searchParams.get('branchId'), 10);
    const schoolId = parseInt(searchParams.get('schoolId'), 10);

    if (!branchId || !schoolId) {
      console.log(`DEBUG: Missing branchId=${branchId} or schoolId=${schoolId}`);
      return NextResponse.json({ error: 'Missing branchId or schoolId' }, { status: 400 });
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    const where = {
      class: {
        name: className.toUpperCase(),
        branchId,
        schoolId,
        academicYear,
      },
    };

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        include: {
          subject: true,
          teacher: { select: { username: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.classSubject.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json(
      {
        classSubjects,
        totalPages,
        currentPage: page,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET SemesterResults/${params.className}/class-subjects Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch class subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}