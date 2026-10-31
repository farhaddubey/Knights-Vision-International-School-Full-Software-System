import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await request.json();
    const syllabus = await prisma.testSubjectSyllabus.update({
      where: { id: parseInt(params.id) },
      data: {
        subjectName: data.subjectName,
        syllabus: data.syllabus,
        weightage: parseFloat(data.weightage),
        testId: parseInt(data.testId),
      },
    });
    return NextResponse.json(syllabus);
  } catch (error) {
    console.error('Error updating test subject syllabus:', error);
    return NextResponse.json({ error: 'Failed to update test subject syllabus' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.testSubjectSyllabus.delete({
      where: { id: parseInt(params.id) },
    });
    return NextResponse.json({ message: 'Test subject syllabus deleted successfully' });
  } catch (error) {
    console.error('Error deleting test subject syllabus:', error);
    return NextResponse.json({ error: 'Failed to delete test subject syllabus' }, { status: 500 });
  }
}