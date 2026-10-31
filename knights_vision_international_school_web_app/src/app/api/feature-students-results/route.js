import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// ✅ GET all student results
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated student results
    const results = await prisma.featureStudentsResults.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    // Count total student results for pagination
    const totalResults = await prisma.featureStudentsResults.count();

    // Log the response for debugging
    console.log('[API /api/feature-students-results] GET Response:', {
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
    return NextResponse.json(
      { error: 'Failed to fetch student results', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST a new student result
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      img_url,
      title,
      position,
      marks,
      pass_year,
      college,
      designation,
      qualified_profession_year,
      highest_awards,
      highest_respect,
    } = body;

    const result = await prisma.featureStudentsResults.create({
      data: {
        img_url,
        title,
        position,
        marks,
        pass_year,
        college,
        designation,
        qualified_profession_year,
        highest_awards,
        highest_respect,
      },
    });

    // Log the created result
    console.log('[API /api/feature-students-results] POST Response:', result);

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create student result', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
