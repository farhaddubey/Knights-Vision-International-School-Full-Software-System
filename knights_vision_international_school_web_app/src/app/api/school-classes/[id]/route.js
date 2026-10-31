import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(req, { params }) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ error: 'Invalid or missing class ID' }, { status: 400 });
    }

    const classData = await prisma.schoolClass.findUnique({
      where: { id: parseInt(id) },
      include: {
        branch: { select: { name: true } },
        classTeacher: { select: { id: true, username: true } },
      },
    });

    if (!classData) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    return NextResponse.json(classData, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch class', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, branchId, schoolId, name, section, roomNumber, academicYear, classTeacherId } = await req.json();

    const updateData = {};

    if (branchId) updateData.branchId = parseInt(branchId);
    if (schoolId) updateData.schoolId = parseInt(schoolId);
    if (academicYear) updateData.academicYear = parseInt(academicYear);
    if (name) updateData.name = name;
    updateData.section = section || null;
    updateData.roomNumber = roomNumber || null;
    updateData.classTeacherId = classTeacherId ? parseInt(classTeacherId) : null;

    const updatedClass = await prisma.schoolClass.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    console.error('PUT Error:', error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update class', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}


export async function DELETE(req, { params }) {
  try {
    const { id } = params;

    await prisma.schoolClass.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('DELETE Error:', error.message);
    return NextResponse.json({ error: 'Failed to delete class', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}