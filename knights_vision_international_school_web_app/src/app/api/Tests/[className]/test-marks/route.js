import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const testId = parseInt(searchParams.get('testId'), 10);
    if (!testId) {
      return NextResponse.json({ error: 'Missing testId' }, { status: 400 });
    }

    const testMarks = await prisma.testMark.findMany({
      where: {
        testId,
      },
      include: { student: true },
    });

    return NextResponse.json({ testMarks }, { status: 200 });
  } catch (error) {
    console.error(`GET Tests/${params.className}/test-marks Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch test marks', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const { className } = params;
    const { testMarks } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!Array.isArray(testMarks) || testMarks.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty testMarks array' }, { status: 400 });
    }

    const updatedTestMarks = await prisma.$transaction(
      testMarks.map((tm) =>
        prisma.testMark.update({
          where: { id: tm.id },
          data: {
            marks: tm.marks !== null ? parseFloat(tm.marks) : null,
            maxMarks: parseInt(tm.maxMarks) || 30,
            remarks: tm.remarks || null,
          },
        })
      )
    );

    return NextResponse.json({ testMarks: updatedTestMarks }, { status: 200 });
  } catch (error) {
    console.error(`PUT Tests/${params.className}/test-marks Error:`, error.message);
    return NextResponse.json({ error: 'Failed to update test marks', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}