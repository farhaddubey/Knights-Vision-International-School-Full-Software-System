import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// ✅ GET all currencies
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated currencies
    const currencies = await prisma.currency.findMany({
      skip,
      take: pageSize,
      orderBy: { createdAt: 'desc' },
    });

    // Count total currencies for pagination
    const totalCurrencies = await prisma.currency.count();

    // Log the response for debugging
    console.log('[API /api/currencies] Response:', {
      page,
      pageSize,
      totalCurrencies,
      totalPages: Math.ceil(totalCurrencies / pageSize),
      currencyCount: currencies.length,
    });

    return NextResponse.json({
      currencies,
      total: totalCurrencies,
      page,
      pageSize,
      totalPages: Math.ceil(totalCurrencies / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch currencies', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// ✅ POST create currency
export async function POST(request) {
  try {
    const body = await request.json();
    const currency = await prisma.currency.create({
      data: {
        code: body.code,
        name: body.name,
        symbol: body.symbol,
      },
    });
    return NextResponse.json(currency, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create currency' }, { status: 500 });
  }
}
