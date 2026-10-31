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

    // Validate pagination parameters
    if (page < 1 || pageSize < 1 || pageSize > 100) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const whereClause = {
      class: {
        name: className.toUpperCase(),
      },
      // title: { contains: searchQuery, mode: 'insensitive' },
    };

    const [instructions, total] = await Promise.all([
      prisma.classFoodInstruction.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.classFoodInstruction.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ instructions, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET FoodInstructions/${params.className}/food-instructions Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch food instructions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { instructions } = await request.json();

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    if (!Array.isArray(instructions) || instructions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty instructions array' }, { status: 400 });
    }

    const savedInstructions = await prisma.$transaction(
      instructions.map((instr) =>
        prisma.classFoodInstruction.create({
          data: {
            class: {
              connect: {
                name_branchId_academicYear: {
                  name: className.toUpperCase(),
                  branchId: instr.branchId || 1,
                  academicYear: instr.academicYear || academicYear,
                },
              },
            },
            title: instr.title,
            description: instr.description || null,
            foodType: instr.foodType,
            suggestedItems: instr.suggestedItems,
            mediaUrl: instr.mediaUrl || null,
            timeOfDay: instr.timeOfDay || null,
            weekDay: instr.weekDay || null,
            frequency: instr.frequency,
          },
        })
      )
    );

    return NextResponse.json({ instructions: savedInstructions }, { status: 201 });
  } catch (error) {
    console.error(`POST FoodInstructions/${params.className}/food-instructions Error:`, error);
    return NextResponse.json({ error: 'Failed to create food instructions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}