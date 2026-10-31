import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


// GET: Fetch a single feature platform item by ID
export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    const featureItem = await prisma.siteFeaturePlatforms.findUnique({
      where: { id },
    });

    if (!featureItem) {
      return NextResponse.json({ error: 'Feature item not found' }, { status: 404 });
    }

    return NextResponse.json(featureItem, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature item' }, { status: 500 });
  }
}

// PUT update feature platform
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedPlatform = await prisma.siteFeaturePlatforms.update({
      where: { id: parseInt(id) },
      data: {
        title: body.title,
        description: body.description || null,
        page_link: body.page_link || null,
        img_url: body.img_url || null,
      },
    });

    console.log('[API /api/site-feature-platforms/[id]] PUT Response:', updatedPlatform);

    return NextResponse.json(updatedPlatform);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update platform', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE feature platform
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.siteFeaturePlatforms.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/site-feature-platforms/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Platform deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete platform', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}