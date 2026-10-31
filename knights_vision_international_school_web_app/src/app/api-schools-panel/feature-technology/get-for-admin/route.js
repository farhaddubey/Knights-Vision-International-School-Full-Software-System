import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// GET all feature technologies
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const technologies = await prisma.featureTechnology.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalTechnologies = await prisma.featureTechnology.count();

    console.log('[API /api/feature-technology] Response:', {
      page,
      pageSize,
      totalTechnologies,
      totalPages: Math.ceil(totalTechnologies / pageSize),
      technologyCount: technologies.length,
    });

    return NextResponse.json({
      technologies,
      total: totalTechnologies,
      page,
      pageSize,
      totalPages: Math.ceil(totalTechnologies / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch technologies', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new feature technologies
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const technologies = Array.isArray(body) ? body : [body];

    const createdTechnologies = await prisma.featureTechnology.createMany({
      data: technologies.map((tech) => ({
        img_url: tech.img_url || null,
        page_link: tech.page_link || null,
        title_1: tech.title_1 || null,
        title_2: tech.title_2 || null,
      })),
    });

    console.log('[API /api/feature-technology] POST Response:', createdTechnologies);

    return NextResponse.json(createdTechnologies, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create technologies', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}