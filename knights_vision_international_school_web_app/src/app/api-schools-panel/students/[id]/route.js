import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';

export async function PUT(req, { params }) {
  try {
    const authorization = await requirePanelPermission(req, 'student.manage');
    const { id: bodyId, ...data } = await req.json();
    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: 'A valid student id is required.' }, { status: 400 });
    }
    if (bodyId !== undefined && Number(bodyId) !== studentId) {
      return NextResponse.json({ error: 'Student id does not match the requested record.' }, { status: 400 });
    }
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true },
    });
    if (!currentStudent) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, currentStudent)) {
      return NextResponse.json({ error: 'You cannot update a student outside your assigned school scope.' }, { status: 403 });
    }
    const nextScope = {
      schoolId: data.schoolId ? Number(data.schoolId) : currentStudent.schoolId,
      branchId: data.branchId ? Number(data.branchId) : currentStudent.branchId,
      classId: data.classId ? Number(data.classId) : currentStudent.classId,
    };
    if (!hasScopeAccess(authorization, nextScope)) {
      return NextResponse.json({ error: 'You cannot move a student outside your assigned school scope.' }, { status: 403 });
    }
    const updatedStudent = await prisma.student.update({
      where: { id: studentId },
      data,
    });

    return NextResponse.json(updatedStudent, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("PUT Error:", error.message);
    return NextResponse.json({ error: "Failed to update student" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const authorization = await requirePanelPermission(req, 'student.manage');
    const { id } = await params;
    const studentId = Number(id);
    if (!Number.isInteger(studentId) || studentId <= 0) {
      return NextResponse.json({ error: 'A valid student id is required.' }, { status: 400 });
    }
    const currentStudent = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true },
    });
    if (!currentStudent) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, currentStudent)) {
      return NextResponse.json({ error: 'You cannot delete a student outside your assigned school scope.' }, { status: 403 });
    }

    await prisma.student.delete({
      where: { id: studentId },
    });

    return NextResponse.json({ message: 'Student deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("DELETE Error:", error.message);
    return NextResponse.json({ error: "Failed to delete student" }, { status: 500 });
  }
}
