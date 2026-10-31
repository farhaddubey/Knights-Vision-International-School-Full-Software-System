import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req) {
  try {
    const teachers = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
      },
      orderBy: { username: 'asc' },
    });

    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch teachers", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}