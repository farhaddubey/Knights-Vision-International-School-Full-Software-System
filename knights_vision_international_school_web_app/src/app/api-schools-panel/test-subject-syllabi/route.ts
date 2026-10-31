import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

  try {
    const syllabi = await prisma.testSubjectSyllabus.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        test: { select: { name: true } },
      }
    });
    const total = await prisma.testSubjectSyllabus.count();
    return NextResponse.json({
      syllabi,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error('Error fetching test subject syllabi:', error);
    return NextResponse.json({ error: 'Failed to fetch test subject syllabi' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const syllabi = Array.isArray(data) ? data : [data];

    const createdSyllabi = await prisma.$transaction(
      syllabi.map((syllabus) =>
        prisma.testSubjectSyllabus.create({
          data: {
            subjectName: syllabus.subjectName,
            syllabus: syllabus.syllabus,
            weightage: parseFloat(syllabus.weightage),
            testId: parseInt(syllabus.testId),
          },
        })
      )
    );

    return NextResponse.json(createdSyllabi, { status: 201 });
  } catch (error) {
    console.error('Error creating test subject syllabi:', error);
    return NextResponse.json({ error: 'Failed to create test subject syllabi' }, { status: 500 });
  }
}