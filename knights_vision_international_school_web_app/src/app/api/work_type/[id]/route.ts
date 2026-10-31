import prisma from "@/src/lib/prisma";
import { NextResponse, NextRequest } from "next/server";


export async function GET(_: Request, { params }) {
  const { id } = params;
  try {
    const workType = await prisma.work_type.findUnique({
      where: { id: Number(id) },
    });
    if (!workType) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(workType);
  } catch (error) {
    console.error('❌ GET by ID Error:', error);
    return NextResponse.json({ error: 'Failed to fetch work type' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }) {
  const { id } = params;
  const body = await req.json();
  const { type_name, role, department, description, video_url } = body;

  try {
    const updated = await prisma.work_type.update({
      where: { id: Number(id) },
      data: { type_name, role, department, description, video_url },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error('❌ PUT Error:', error);
    return NextResponse.json({ error: 'Failed to update work type' }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }) {
  const { id } = params;

  try {
    await prisma.work_type.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ DELETE Error:', error);
    return NextResponse.json({ error: 'Failed to delete work type' }, { status: 500 });
  }
}
