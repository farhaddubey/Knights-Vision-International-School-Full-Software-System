import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(req) {
  try {
    const classSubjects = await prisma.classSubject.findMany({
      select: {
        id: true,
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
      },
      orderBy: [{ class: { name: 'asc' } }, { subject: { name: 'asc' } }],
    });

    return NextResponse.json(classSubjects, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch class subjects", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}