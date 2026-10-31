import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// GET all feature platforms
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const platforms = await prisma.siteFeaturePlatforms.findMany({
      skip,
      take: pageSize,
      orderBy: { id: 'desc' },
    });

    const totalPlatforms = await prisma.siteFeaturePlatforms.count();

    console.log('[API /api/site-feature-platforms] Response:', {
      page,
      pageSize,
      totalPlatforms,
      totalPages: Math.ceil(totalPlatforms / pageSize),
      platformCount: platforms.length,
    });

    return NextResponse.json({
      platforms,
      total: totalPlatforms,
      page,
      pageSize,
      totalPages: Math.ceil(totalPlatforms / pageSize),
    });
  } catch (error) {
    console.error('❌ GET Error:', error);
    return NextResponse.json({ error: 'Failed to fetch platforms', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// POST new feature platforms
export async function POST(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const platforms = Array.isArray(body) ? body : [body];

    const createdPlatforms = await prisma.siteFeaturePlatforms.createMany({
      data: platforms.map((platform) => ({
        title: platform.title,
        description: platform.description || null,
        page_link: platform.page_link || null,
        img_url: platform.img_url || null,
      })),
    });

    console.log('[API /api/site-feature-platforms] POST Response:', createdPlatforms);

    return NextResponse.json(createdPlatforms, { status: 201 });
  } catch (error) {
    console.error('❌ POST Error:', error);
    return NextResponse.json({ error: 'Failed to create platforms', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}