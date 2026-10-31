import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// PUT update student result
export async function PUT(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();

    const updatedResult = await prisma.featureStudentsResults.update({
      where: { id: parseInt(id) },
      data: {
        img_url: body.img_url || null,
        title: body.title || null,
        position: body.position || null,
        marks: body.marks || null,
        pass_year: body.pass_year || null,
        college: body.college || null,
        designation: body.designation || null,
        qualified_profession_year: body.qualified_profession_year || null,
        highest_awards: body.highest_awards || null,
        highest_respect: body.highest_respect || null,
      },
    });

    console.log('[API /api/feature-students-results/[id]] PUT Response:', updatedResult);

    return NextResponse.json(updatedResult);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update result', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE student result
export async function DELETE(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    await prisma.featureStudentsResults.delete({
      where: { id: parseInt(id) },
    });

    console.log('[API /api/feature-students-results/[id]] DELETE Response:', { id });

    return NextResponse.json({ message: 'Result deleted successfully' });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete result', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}