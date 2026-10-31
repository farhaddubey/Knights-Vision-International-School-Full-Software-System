import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// GET all student results
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const results = await prisma.featureStudentsResults.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalResults = await prisma.featureStudentsResults.count();

    console.log('[API /api/feature-students-results] Response:', {
      page,
      pageSize,
      totalResults,
      totalPages: Math.ceil(totalResults / pageSize),
      resultCount: results.length,
    });

    return NextResponse.json({
      results,
      total: totalResults,
      page,
      pageSize,
      totalPages: Math.ceil(totalResults / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new student results
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const results = Array.isArray(body) ? body : [body];

    const createdResults = await prisma.featureStudentsResults.createMany({
      data: results.map((result) => ({
        img_url: result.img_url || null,
        title: result.title || null,
        position: result.position || null,
        marks: result.marks || null,
        pass_year: result.pass_year || null,
        college: result.college || null,
        designation: result.designation || null,
        qualified_profession_year: result.qualified_profession_year || null,
        highest_awards: result.highest_awards || null,
        highest_respect: result.highest_respect || null,
      })),
    });

    console.log('[API /api/feature-students-results] POST Response:', createdResults);

    return NextResponse.json(createdResults, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}