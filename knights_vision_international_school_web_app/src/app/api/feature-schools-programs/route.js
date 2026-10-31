import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// ✅ GET all school programs
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated school programs
    const programs = await prisma.featureSchoolsPrograms.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    // Count total programs for pagination
    const totalPrograms = await prisma.featureSchoolsPrograms.count();

    // Log the response for debugging
    console.log('[API /api/feature-schools-programs] GET Response:', {
      page,
      pageSize,
      totalPrograms,
      totalPages: Math.ceil(totalPrograms / pageSize),
      programCount: programs.length,
    });

    return NextResponse.json({
      programs,
      total: totalPrograms,
      page,
      pageSize,
      totalPages: Math.ceil(totalPrograms / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch school programs', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST a new school program
export async function POST(req) {
  try {
    const body = await req.json();
    const { img_url, title, description, type } = body;

    // Validate required fields
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const program = await prisma.featureSchoolsPrograms.create({
      data: {
        img_url,
        title,
        description,
        type,
      },
    });

    console.log('[API /api/feature-schools-programs] POST Response:', program);

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create school program', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}