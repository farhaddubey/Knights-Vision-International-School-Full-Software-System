import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request) {
  try {

    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get('classId'), 10);

    if (!classId) {
      return NextResponse.json({ error: 'Missing classId' }, { status: 400 });
    }

    const currentClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
    });

    if (!currentClass) {
      return NextResponse.json({ error: 'Current class not found.' }, { status: 404 });
    }

    const nextClass = await prisma.schoolClass.findFirst({
      where: { id: classId + 1 },
    });

    return NextResponse.json({ nextClassId: nextClass ? nextClass.id : classId + 1 }, { status: 200 });
  } catch (error) {
    console.error('GET Next Class Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch next class', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}