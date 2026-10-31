import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import slugify from 'slugify';

// ✅ GET all countries
export async function GET() {
  try {
    const countries = await prisma.country.findMany({
      orderBy: { createdAt: 'desc' },
      include: { currency: true, timezone: true },
    });
    return NextResponse.json(countries);
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch countries' }, { status: 500 });
  }
}

// ✅ POST create country
export async function POST(request) {
  try {
    const body = await request.json();

    const country = await prisma.country.create({
      data: {
        name: body.name,
        slug: body.slug || slugify(body.name, { lower: true }), // Auto-generate slug if not provided
        code: body.code,
        currencyId: body.currencyId,
        timezoneId: body.timezoneId,
        contactInfo: body.contactInfo || null,
        translations: body.translations || {}, // default to empty object
      },
    });

    return NextResponse.json(country, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to create country', details: error.message || error },
      { status: 500 }
    );
  }
}
