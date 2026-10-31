import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


// PUT update school program
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedProgram = await prisma.featureSchoolsPrograms.update({
      where: { id: parseInt(id) },
      data: {
        img_url: body.img_url || null,
        title: body.title || null,
        description: body.description || null,
        type: body.type || 'REPUBLIC_DAY',
      },
    });

    console.log('[API /api/feature-schools-programs/[id]] PUT Response:', updatedProgram);

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update program', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE school program
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.featureSchoolsPrograms.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/feature-schools-programs/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Program deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete program', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}