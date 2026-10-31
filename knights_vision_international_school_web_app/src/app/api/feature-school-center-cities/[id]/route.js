import prisma from '@/src/lib/prisma';
import { NextResponse } from 'next/server';


// PUT update school center city
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedCity = await prisma.featureSchoolCenterCities.update({
      where: { id: parseInt(id) },
      data: {
        img_url: body.img_url || null,
        title: body.title || null,
      },
    });

    console.log('[API /api/feature-school-center-cities/[id]] PUT Response:', updatedCity);

    return NextResponse.json(updatedCity);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update city', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE school center city
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.featureSchoolCenterCities.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/feature-school-center-cities/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'City deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete city', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}