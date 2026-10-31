import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// GET: Fetch all FeatureTechnology records
export async function GET(req) {
  try {
    const technologies = await prisma.featureTechnology.findMany({
      select: {
        id: true,
        img_url: true,
        page_link: true,
        title_1: true,
        title_2: true,
      },
      orderBy: { id: 'asc' },
    });

    return NextResponse.json(technologies, { status: 200 });
  } catch (error) {
    console.error('Error fetching FeatureTechnology records:', error);
    return NextResponse.json(
      { error: 'Error fetching FeatureTechnology records', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// POST: Create a new FeatureTechnology record
export async function POST(req) {
  try {
    const data = await req.json();
    const technology = await prisma.featureTechnology.create({
      data: {
        img_url: data.img_url || null,
        page_link: data.page_link || null,
        title_1: data.title_1 || null,
        title_2: data.title_2 || null,
      },
    });

    return NextResponse.json(technology, { status: 201 });
  } catch (error) {
    console.error('Error creating FeatureTechnology record:', error);
    return NextResponse.json(
      { error: 'Error creating FeatureTechnology record', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}