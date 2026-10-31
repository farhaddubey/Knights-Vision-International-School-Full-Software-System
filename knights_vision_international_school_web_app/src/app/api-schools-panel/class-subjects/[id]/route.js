import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();
    const updatedClassSubject = await prisma.classSubject.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedClassSubject, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error.message);
    return NextResponse.json({ error: "Failed to update class subject", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const id = url.pathname.split('/').pop();

    await prisma.classSubject.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Class subject deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete class subject", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}