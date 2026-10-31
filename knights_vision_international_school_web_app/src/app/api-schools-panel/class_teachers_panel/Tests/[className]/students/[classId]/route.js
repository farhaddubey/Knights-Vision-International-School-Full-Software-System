import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className, classId } = params;


    const parsedClassId = parseInt(classId, 10);
    if (!parsedClassId) {
      return NextResponse.json({ error: 'Missing or invalid classId' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { classId: parsedClassId },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error(`GET Tests/${params.className}/students/${params.classId} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}