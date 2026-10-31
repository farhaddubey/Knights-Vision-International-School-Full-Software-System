import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// GET: Fetch districts with pagination
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '20', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated districts
    const districts = await prisma.district.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { state: true },
    });

    // Count total districts for pagination
    const totalDistricts = await prisma.district.count();

    // Log the response for debugging
    console.log('[API /api/districts] Response:', {
      page,
      pageSize,
      totalDistricts,
      totalPages: Math.ceil(totalDistricts / pageSize),
      districtCount: districts.length,
    });

    return NextResponse.json({
      data: districts,
      total: totalDistricts,
      page,
      pageSize,
      totalPages: Math.ceil(totalDistricts / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch districts', details: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST create district
export async function POST(request) {
  try {
    const body = await request.json();
    const district = await prisma.district.create({
      data: {
        name: body.name,
        stateId: body.stateId,
        managerId: body.managerId,
        contactInfo: body.contactInfo,
      },
    });
    return NextResponse.json(district, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create district' }, { status: 500 });
  }
}
