import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// ✅ GET all states
// GET: Fetch all states
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated states
    const states = await prisma.state.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
      include: { country: true },
    });

    // Count total states for pagination
    const totalStates = await prisma.state.count();

    // Log the response for debugging
    console.log('[API /api/states] Response:', {
      page,
      pageSize,
      totalStates,
      totalPages: Math.ceil(totalStates / pageSize),
      stateCount: states.length,
    });

    return NextResponse.json({
      states,
      total: totalStates,
      page,
      pageSize,
      totalPages: Math.ceil(totalStates / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch states', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function POST(request) {
  try {
    const body = await request.json();

    // Basic validation for required fields
    if (!body.name || !body.countryId || !body.slug || !body.code) {
      return NextResponse.json(
        { error: "Missing required fields: name, countryId, slug, or code" },
        { status: 400 }
      );
    }

    const state = await prisma.state.create({
      data: {
        name: body.name,
        countryId: body.countryId,
        headId: body.headId || null,
        contactInfo: body.contactInfo || null,
        slug: body.slug,
        code: body.code,
      },
    });

    return NextResponse.json(state, { status: 201 });
  } catch (error) {
    console.error("❌ POST Error:", error);
    return NextResponse.json({ error: "Failed to create state" }, { status: 500 });
  }
}
