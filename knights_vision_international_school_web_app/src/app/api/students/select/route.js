import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(req) {
  try {
    const students = await prisma.student.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json(students, { status: 200 });
  } catch (error) {
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch students", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}