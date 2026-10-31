import {  NextResponse } from "next/server";
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
    const searchQuery = searchParams.get('searchQuery') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

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
        // section: 'A',
        branchId,
        academicYear,
      },
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
          class: true,
          feeScheme: true,
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
      guardianName: student.guardianName,
      gender: student.gender,
      dateOfBirth: student.dateOfBirth,
      admissionDate: student.admissionDate,
      status: student.status,
      aadhaarNumber: student.aadhaarNumber,
      isScholarshipHolder: student.isScholarshipHolder,
      isTransportRequired: student.isTransportRequired,
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
    console.error(`GET SemesterResults/${params.className}/students Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}