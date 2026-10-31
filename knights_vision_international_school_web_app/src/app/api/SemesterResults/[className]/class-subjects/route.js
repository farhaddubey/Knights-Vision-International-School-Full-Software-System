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
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    const where = {
      class: {
        name: className.toUpperCase(),
        branchId,
        academicYear,
      },
    };

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        include: {
          subject: true,
          teacher: {
            select: { username: true },
          },
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