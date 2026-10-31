import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request, { params }) {
  try {
    const className = params.className;
    const classId = params.classId;
    if (!classMap[className.toLowerCase()]) {
      return NextResponse.json({ error: `Invalid class name: ${className}` }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: {
         classId: parseInt(classId) 
      },
      select: { id: true, firstName: true, middleName: true, lastName: true },
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