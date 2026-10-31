import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get('classId'), 10);

    const students = await prisma.student.findMany({
      where: { classId },
      select: { id: true, name: true },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyPublicSpeechSubmissions/${params.className}/students Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}