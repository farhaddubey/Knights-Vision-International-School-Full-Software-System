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
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Validate academicYear
    if (!academicYear || isNaN(academicYear)) {
      return NextResponse.json({ error: 'Invalid academic year' }, { status: 400 });
    }

    const whereClause = {
      class: {
        name: className.toUpperCase(),
        branchId,
        academicYear,
      },
      OR: searchQuery
        ? [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { type: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [punishments, total] = await Promise.all([
      prisma.punishment.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.punishment.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ punishments, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET Punishments/${params.className} Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch punishments', detail: error.message }, { status: 500 });
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

    const punishment = await prisma.punishment.create({
      data: {
        class: {
          connect: {
            name_branchId_academicYear: {
              name: className.toUpperCase(),
              branchId: data.branchId || 1,
              academicYear: data.academicYear || academicYear,
            },
          },
        },
        title: data.title,
        description: data.description,
        severity: parseInt(data.severity),
        type: data.type,
      },
    });

    return NextResponse.json(punishment, { status: 201 });
  } catch (error) {
    console.error(`POST Punishments/${params.className} Error:`, error);
    return NextResponse.json({ error: 'Failed to create punishment', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
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

    if (!data.id) {
      return NextResponse.json({ error: 'Missing punishment ID' }, { status: 400 });
    }

    const punishment = await prisma.punishment.update({
      where: { id: parseInt(data.id) },
      data: {
        class: {
          connect: {
            name_branchId_academicYear: {
              name: className.toUpperCase(),
              branchId: data.branchId || 1,
              academicYear: data.academicYear || academicYear,
            },
          },
        },
        title: data.title,
        description: data.description,
        severity: parseInt(data.severity),
        type: data.type,
      },
    });

    return NextResponse.json(punishment, { status: 200 });
  } catch (error) {
    console.error(`PUT Punishments/${params.className} Error:`, error);
    return NextResponse.json({ error: 'Failed to update punishment', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}