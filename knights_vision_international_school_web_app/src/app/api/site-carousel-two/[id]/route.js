import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// PUT update carousel item
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedItem = await prisma.site_carousel_two.update({
      where: { id: parseInt(id) },
      data: {
        img_url: body.img_url || null,
        page_link: body.page_link || null,
        title_1: body.title_1 || null,
        title_2: body.title_2 || null,
      },
    });

    console.log('[API /api/site-carousel-two/[id]] PUT Response:', updatedItem);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update carousel item', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE carousel item
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.site_carousel_two.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/site-carousel-two/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Carousel item deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete carousel item', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}