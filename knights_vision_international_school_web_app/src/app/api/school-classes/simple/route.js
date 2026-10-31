import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
  try {
    const classes = await prisma.schoolClass.findMany({
      select: {
        id: true,
        name: true,
        section: true,
        classTeacher: { select: { id: true, username: true } },
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(classes, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch classes', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}