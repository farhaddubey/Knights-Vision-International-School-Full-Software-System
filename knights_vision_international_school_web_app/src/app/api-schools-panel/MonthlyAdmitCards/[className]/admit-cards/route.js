import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, context) {
  try {
    const { className } = await context.params;
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('searchQuery') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const currentYear = new Date().getFullYear();

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const where = {
      class: { name: className.toUpperCase() },
      academicYear: currentYear,
      admittedViaTest: false,
      OR: searchQuery
        ? [
            { firstName: { contains: searchQuery, mode: 'insensitive' } },
            { lastName: { contains: searchQuery, mode: 'insensitive' } },
            { admissionNumber: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: { select: { name: true, section: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      middleName: student.middleName,
      lastName: student.lastName,
      admissionNumber: student.admissionNumber,
      rollNumber: student.rollNumber,
      studentCategory: student.studentCategory,
      class: {
        name: student.class?.name,
        section: student.class?.section,
      },
    }));

    return NextResponse.json(
      {
        students: formattedStudents,
        totalPages,
        currentPage: page,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET MonthlyAdmitCards/admit-cards Error:", error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
