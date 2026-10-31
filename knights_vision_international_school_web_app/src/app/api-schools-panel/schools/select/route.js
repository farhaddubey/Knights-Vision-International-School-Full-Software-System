import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
  try {
    const schools = await prisma.school.findMany({
      select: {
        id: true,
        name: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json(schools, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch schools", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}