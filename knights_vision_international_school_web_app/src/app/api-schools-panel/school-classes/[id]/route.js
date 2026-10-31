import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';
import { eligibleClassTeacherForScope } from '@/src/lib/rbac/classTeacherEligibility';

function classIdFromRequest(req) {
  const id = Number(new URL(req.url).pathname.split('/').filter(Boolean).pop());
  if (!Number.isInteger(id) || id <= 0) throw new PanelAuthorizationError(400, 'A valid class id is required.');
  return id;
}

export async function GET(req) {
  try {
    const authorization = await requirePanelPermission(req, 'class.read');
    const id = classIdFromRequest(req);
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id },
      include: {
        branch: { select: { id: true, name: true, schoolId: true } },
        classTeacher: { select: { id: true, username: true } },
      },
    });
    if (!schoolClass) return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    if (!hasScopeAccess(authorization, schoolClass)) {
      return NextResponse.json({ error: 'You cannot view a class outside your assigned school scope.' }, { status: 403 });
    }
    return NextResponse.json(schoolClass, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === 'PanelAuthorizationError') {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch class.' }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const authorization = await requirePanelPermission(req, 'class.manage');

    const { id, branchId, schoolId, name, section, roomNumber, academicYear, classTeacherId } = await req.json();
    const numericId = Number(id);
    const numericSchoolId = Number(schoolId);
    const numericBranchId = Number(branchId);
    if (![numericId, numericSchoolId, numericBranchId].every((value) => Number.isInteger(value) && value > 0)) {
      return NextResponse.json({ error: 'Valid class, school, and branch identifiers are required.' }, { status: 400 });
    }
    const currentClass = await prisma.schoolClass.findUnique({
      where: { id: numericId },
      select: { id: true, schoolId: true, branchId: true },
    });
    if (!currentClass) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, currentClass)) {
      return NextResponse.json({ error: 'You cannot update a class outside your assigned school scope.' }, { status: 403 });
    }
    if ((currentClass.schoolId !== numericSchoolId || currentClass.branchId !== numericBranchId) &&
      !hasScopeAccess(authorization, { schoolId: numericSchoolId, branchId: numericBranchId })) {
      return NextResponse.json({ error: 'You cannot move a class outside your assigned school or branch scope.' }, { status: 403 });
    }

    // Validate foreign keys
    const targetBranch = await prisma.schoolBranch.findFirst({ where: { id: numericBranchId, schoolId: numericSchoolId }, select: { id: true } });
    if (!targetBranch) {
      return NextResponse.json({ error: 'The selected branch does not belong to the selected school.' }, { status: 400 });
    }
    const numericTeacherId = classTeacherId == null || classTeacherId === '' ? null : Number(classTeacherId);
    if (numericTeacherId != null && (!Number.isInteger(numericTeacherId) || numericTeacherId <= 0)) {
      return NextResponse.json({ error: 'classTeacherId must be a valid teacher identifier.' }, { status: 400 });
    }
    if (numericTeacherId && !(await eligibleClassTeacherForScope(prisma, numericTeacherId, { schoolId: numericSchoolId, branchId: numericBranchId, classId: numericId }))) {
      return NextResponse.json({ error: 'The selected staff member is not eligible for this class-teacher assignment and scope.' }, { status: 400 });
    }

    // Check unique constraint
    const existingClass = await prisma.schoolClass.findFirst({
      where: {
        schoolId: numericSchoolId,
        branchId: numericBranchId,
        name,
        section: section || null,
        academicYear: parseInt(academicYear),
        NOT: { id: numericId },
      },
    });
    if (existingClass) {
      return NextResponse.json({ error: `Class ${name} (${section || 'N/A'}) already exists for this school, branch, and academic year` }, { status: 400 });
    }

    const updatedClass = await prisma.schoolClass.update({
      where: { id: numericId },
      data: {
        branchId: numericBranchId,
        schoolId: numericSchoolId,
        name,
        section: section || null,
        roomNumber: roomNumber || null,
        academicYear: parseInt(academicYear),
        classTeacherId: numericTeacherId,
      },
      include: {
        branch: { select: { name: true } },
        classTeacher: { select: { id: true, username: true } },
      },
    });

    return NextResponse.json(updatedClass, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('PUT Error:', error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}


export async function DELETE(req) {
  try {
    const authorization = await requirePanelPermission(req, 'class.manage');
    const id = classIdFromRequest(req);
    const currentClass = await prisma.schoolClass.findUnique({
      where: { id },
      select: { id: true, schoolId: true, branchId: true },
    });
    if (!currentClass) {
      return NextResponse.json({ error: 'Class not found.' }, { status: 404 });
    }
    if (!hasScopeAccess(authorization, currentClass)) {
      return NextResponse.json({ error: 'You cannot delete a class outside your assigned school scope.' }, { status: 403 });
    }

    await prisma.schoolClass.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Class deleted successfully' }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('DELETE Error:', error.message);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
