import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...data } = await req.json();
    const updatedBranch = await prisma.schoolBranch.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBranch, { status: 200 });
  } catch (error) {
    console.error("PUT Error:", error.message);
    return NextResponse.json({ error: "Failed to update branch", detail: error.message }, { status: 500 });
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

    await prisma.schoolBranch.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Branch deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete branch", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}