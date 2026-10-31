import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const whereClause = {
      class: { name: className.toUpperCase() },
      title: { contains: searchQuery, mode: 'insensitive' },
    };

    const [occasions, total] = await Promise.all([
      prisma.publicSpeakingOccasion.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { occasionDate: 'desc' },
      }),
      prisma.publicSpeakingOccasion.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ occasions, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyPublicSpeakingOccasions/${params.className}/occasions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch occasions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { occasions } = await request.json();

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (!Array.isArray(occasions) || occasions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty occasions array' }, { status: 400 });
    }

    const savedOccasions = await prisma.$transaction(
      occasions.map((occasion) =>
        prisma.publicSpeakingOccasion.create({
          data: {
            title: occasion.title,
            description: occasion.description || null,
            occasionDate: new Date(occasion.occasionDate),
            class: { connect: { name: className.toUpperCase() } },
            schoolId: occasion.schoolId,
            branchId: occasion.branchId,
            languageMedium: occasion.languageMedium,
            isActive: occasion.isActive,
          },
        })
      )
    );

    return NextResponse.json({ occasions: savedOccasions }, { status: 201 });
  } catch (error) {
    console.error(`POST MonthlyPublicSpeakingOccasions/${params.className}/occasions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create occasions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}