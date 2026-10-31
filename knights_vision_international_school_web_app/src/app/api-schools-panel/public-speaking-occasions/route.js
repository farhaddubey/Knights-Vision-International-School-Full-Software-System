import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';

    const whereClause = {
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
    console.error('GET Public Speaking Occasions Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch occasions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const { occasions } = await request.json();

    if (!Array.isArray(occasions) || occasions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty occasions array' }, { status: 400 });
    }

    const savedOccasions = await prisma.$transaction(
      occasions.map((occasion) =>
        prisma.publicSpeakingOccasion.create({
          data: {
            title: occasion.title,
            description: occasion.description || null,
            occasionDate: occasion.occasionDate,
            classId: occasion.classId,
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
    console.error('POST Public Speaking Occasions Error:', error.message);
    return NextResponse.json({ error: 'Failed to create occasions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}