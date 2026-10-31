import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// GET all school programs
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const programs = await prisma.featureSchoolsPrograms.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalPrograms = await prisma.featureSchoolsPrograms.count();

    console.log('[API /api/feature-schools-programs] Response:', {
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
    return NextResponse.json({ error: 'Failed to fetch programs', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new school programs
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const programs = Array.isArray(body) ? body : [body];

    const createdPrograms = await prisma.featureSchoolsPrograms.createMany({
      data: programs.map((program) => ({
        img_url: program.img_url || null,
        title: program.title || null,
        description: program.description || null,
        type: program.type || 'REPUBLIC_DAY',
      })),
    });

    console.log('[API /api/feature-schools-programs] POST Response:', createdPrograms);

    return NextResponse.json(createdPrograms, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create programs', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}