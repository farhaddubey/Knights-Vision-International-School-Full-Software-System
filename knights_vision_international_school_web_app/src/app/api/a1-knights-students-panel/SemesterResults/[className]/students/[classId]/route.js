import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

exports.GET = async function (request, { params }) {
  try {
    const { classId, className } = await params; // Await params
    console.log(`DEBUG: Fetching students for classId=${classId}, className=${className}`);

    const parsedClassId = parseInt(classId, 10);
    if (isNaN(parsedClassId)) {
      console.log(`DEBUG: Invalid classId=${classId}`);
      return NextResponse.json({ error: 'Missing or invalid classId' }, { status: 400 });
    }

    const classSubjectId = parseInt(request.nextUrl.searchParams.get('classSubjectId') || '0', 10);
    console.log(`DEBUG: classSubjectId=${classSubjectId}`);

    const students = await prisma.student.findMany({
      where: { classId: parsedClassId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        rollNumber: true,
        branchId: true,
        schoolId: true,
        classId: true,
      },
      orderBy: { firstName: 'asc' },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    console.error(`GET SemesterResults/students/${params.classId} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
};