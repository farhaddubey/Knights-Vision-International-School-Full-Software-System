import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;

    const nextClass = await prisma.schoolClass.findUnique({
      where: { id: classInfo.nextId },
    });

    return NextResponse.json({ nextClassId: nextClass ? nextClass.id : classInfo.nextId }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/classes/${params.className}/next Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch next class', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}