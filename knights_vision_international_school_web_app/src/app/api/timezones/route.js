import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// ✅ GET all timezones
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated timezones
    const timezones = await prisma.timezone.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    // Count total timezones for pagination
    const totalTimezones = await prisma.timezone.count();

    // Log the response for debugging
    console.log('[API /api/timezones] Response:', {
      page,
      pageSize,
      totalTimezones,
      totalPages: Math.ceil(totalTimezones / pageSize),
      timezoneCount: timezones.length,
    });

    return NextResponse.json({
      timezones,
      total: totalTimezones,
      page,
      pageSize,
      totalPages: Math.ceil(totalTimezones / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch timezones', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
// ✅ POST create timezone
export async function POST(request) {
  try {
    const body = await request.json();
    const timezone = await prisma.timezone.create({
      data: {
        name: body.name,
        offset: body.offset,
      },
    });
    return NextResponse.json(timezone, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create timezone' }, { status: 500 });
  }
}