import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function POST(request, { params }) {
  try {
    const className = params.className;
    const { testId, testMarks } = await request.json();
    // ✅ Validate payload
    if (!testId || !Array.isArray(testMarks)) {
      return NextResponse.json({ error: 'Missing or invalid testId or testMarks' }, { status: 400 });
    }

    const numericTestId = parseInt(testId);

    // ✅ Confirm Test exists
    const test = await prisma.test.findUnique({ where: { id: numericTestId } });
    if (!test) {
      return NextResponse.json({ error: 'Test not found' }, { status: 404 });
    }

    // ✅ Confirm all students exist
    const studentIds = testMarks.map((tm) => tm.studentId);
    const existingStudents = await prisma.student.findMany({
      where: { id: { in: studentIds } },
    });

    if (existingStudents.length !== studentIds.length) {
      return NextResponse.json({ error: 'One or more students not found' }, { status: 404 });
    }

    // ✅ Perform upsert for each test mark
    const upsertPromises = testMarks.map((tm) =>
      prisma.testMark.upsert({
        where: {
          studentId_testId: {
            studentId: tm.studentId,
            testId: numericTestId,
          },
        },
        update: {
          marks: tm.marks !== null ? parseFloat(tm.marks) : null,
          maxMarks: tm.maxMarks !== undefined ? parseInt(tm.maxMarks) : 30,
          remarks: tm.remarks || null,
          updatedAt: new Date(),
        },
        create: {
          studentId: tm.studentId,
          testId: numericTestId,
          marks: tm.marks !== null ? parseFloat(tm.marks) : null,
          maxMarks: tm.maxMarks !== undefined ? parseInt(tm.maxMarks) : 30,
          remarks: tm.remarks || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      })
    );

    await Promise.all(upsertPromises);

    return NextResponse.json({ message: 'Test marks upserted successfully' }, { status: 200 });

  } catch (error) {
    console.error(`POST /api/Tests/${params.className}/test-marks/batch Error:`, error);
    return NextResponse.json(
      { error: 'Failed to upsert test marks', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
