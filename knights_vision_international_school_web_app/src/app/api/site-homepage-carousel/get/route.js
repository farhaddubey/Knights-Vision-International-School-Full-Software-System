import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// 📌 GET: Fetch all carousel images
export async function GET(req) {
  try {
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    // Fetch paginated images
    const images = await prisma.site_homepage_carousel.findMany({
      skip,
      take: pageSize,
      select: {
        id: true,
        img_url: true,
      },
      orderBy: { id: 'asc' },
    });

    // Count total images for pagination
    const totalImages = await prisma.site_homepage_carousel.count();

    // Log the response for debugging
    console.log('[API /api/site-homepage-carousel] Response:', {
      page,
      pageSize,
      totalImages,
      totalPages: Math.ceil(totalImages / pageSize),
      imageCount: images.length,
    });

    return NextResponse.json({
      images,
      total: totalImages,
      page,
      pageSize,
      totalPages: Math.ceil(totalImages / pageSize),
    }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching carousel images:', error);
    return NextResponse.json(
      { error: 'Error fetching carousel images', detail: error.message },
      { status: error.message === 'Unauthorized' || error.message === 'Invalid token' ? 401 : 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
