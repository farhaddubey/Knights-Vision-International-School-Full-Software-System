import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// PUT update feature technology
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedTechnology = await prisma.featureTechnology.update({
      where: { id: parseInt(id) },
      data: {
        img_url: body.img_url || null,
        page_link: body.page_link || null,
        title_1: body.title_1 || null,
        title_2: body.title_2 || null,
      },
    });

    console.log('[API /api/feature-technology/[id]] PUT Response:', updatedTechnology);

    return NextResponse.json(updatedTechnology);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update technology', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE feature technology
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.featureTechnology.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/feature-technology/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Technology deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete technology', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}