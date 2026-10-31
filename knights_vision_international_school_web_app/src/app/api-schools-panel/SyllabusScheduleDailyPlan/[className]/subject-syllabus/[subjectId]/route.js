import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className, subjectId } = params;

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (!subjectId || isNaN(parseInt(subjectId))) {
      return NextResponse.json({ error: 'Missing or invalid subjectId' }, { status: 400 });
    }

    const topics = await prisma.subjectSyllabus.findMany({
      where: { subjectId: parseInt(subjectId) },
      orderBy: { topic: 'asc' },
    });

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error) {
    console.error(`GET SyllabusScheduleDailyPlan/${params.className}/subject-syllabus/${params.subjectId} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch syllabus topics', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}