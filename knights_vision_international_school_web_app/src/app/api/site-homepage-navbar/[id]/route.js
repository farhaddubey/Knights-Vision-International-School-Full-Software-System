import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// GET: Fetch a single navbar item by ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const navItem = await prisma.siteHomePageNavbar.findUnique({
      where: { id },
    });

    if (!navItem) {
      return NextResponse.json({ error: 'Navbar item not found' }, { status: 404 });
    }

    return NextResponse.json(navItem, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch navbar item' }, { status: 500 });
  }
}

// PUT update navbar item
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedItem = await prisma.siteHomePageNavbar.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        slug: body.slug,
        page_link: body.page_link || null,
      },
    });

    console.log('[API /api/site-homepage-navbar/[id]] PUT Response:', updatedItem);

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update navbar item', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE navbar item
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.siteHomePageNavbar.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/site-homepage-navbar/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Navbar item deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete navbar item', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}