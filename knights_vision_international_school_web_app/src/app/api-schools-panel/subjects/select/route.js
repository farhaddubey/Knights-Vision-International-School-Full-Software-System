import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
  try {
    const subjects = await prisma.subject.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(subjects, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch subjects", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}