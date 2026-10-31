import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {

    const classId = params.classId;
    const students = await prisma.student.findMany({
      where: {
        SchoolClass: {
          some: { classId: parseInt(classId) },
        },
      },
      select: { id: true, name: true },
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error(`GET BoardExams/${params.className}/students/${params.classId} Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch students', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}