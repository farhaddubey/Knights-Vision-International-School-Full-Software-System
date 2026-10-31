import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// GET all navbar items
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const items = await prisma.siteHomePageNavbar.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalItems = await prisma.siteHomePageNavbar.count();

    console.log('[API /api/site-homepage-navbar] Response:', {
      page,
      pageSize,
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      itemCount: items.length,
    });

    return NextResponse.json({
      items,
      total: totalItems,
      page,
      pageSize,
      totalPages: Math.ceil(totalItems / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch navbar items', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new navbar items
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const items = Array.isArray(body) ? body : [body];

    const createdItems = await prisma.siteHomePageNavbar.createMany({
      data: items.map((item) => ({
        title: item.title,
        slug: item.slug,
        page_link: item.page_link || null,
      })),
    });

    console.log('[API /api/site-homepage-navbar] POST Response:', createdItems);

    return NextResponse.json(createdItems, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create navbar items', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}