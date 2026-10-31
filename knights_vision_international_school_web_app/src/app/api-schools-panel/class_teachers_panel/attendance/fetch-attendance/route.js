import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hasScopeAccess,
  PanelAuthorizationError,
  requireFacultyPermission,
} from '@/src/lib/rbac/authorization';

function asPositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function classScopeTarget(schoolClass) {
  return { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
}

async function resolveAttendanceClass(request, authorization) {
  const requestedClassId = asPositiveInt(new URL(request.url).searchParams.get('classId'));

  if (requestedClassId) {
    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: requestedClassId },
      select: { id: true, name: true, section: true, schoolId: true, branchId: true, academicYear: true },
    });
    if (!schoolClass) {
      throw new PanelAuthorizationError(404, 'The requested class is not available.');
    }
    if (!hasScopeAccess(authorization, classScopeTarget(schoolClass))) {
      throw new PanelAuthorizationError(403, 'You do not have access to this class attendance register.');
    }
    return schoolClass;
  }

  const classScopedIds = authorization.scopes
    .filter((scope) => scope.scopeType === 'CLASS' && scope.classId)
    .map((scope) => scope.classId);
  if (classScopedIds.length === 1) {
    const schoolClass = await prisma.schoolClass.findFirst({
      where: { id: classScopedIds[0] },
      select: { id: true, name: true, section: true, schoolId: true, branchId: true, academicYear: true },
    });
    if (schoolClass && hasScopeAccess(authorization, classScopeTarget(schoolClass))) return schoolClass;
  }

  const assignedClass = await prisma.schoolClass.findFirst({
    where: { classTeacherId: authorization.user.id },
    select: { id: true, name: true, section: true, schoolId: true, branchId: true, academicYear: true },
    orderBy: { academicYear: 'desc' },
  });
  if (!assignedClass || !hasScopeAccess(authorization, classScopeTarget(assignedClass))) {
    throw new PanelAuthorizationError(403, 'No class-teacher assignment is available. Use a class-teacher account or provide an in-scope classId.');
  }
  return assignedClass;
}

export async function GET(request) {
  try {
    const authorization = await requireFacultyPermission(request, 'attendance.read');
    const schoolClass = await resolveAttendanceClass(request, authorization);
    const { searchParams } = new URL(request.url);
    const page = Math.max(asPositiveInt(searchParams.get('page')) || 1, 1);
    const pageSize = Math.min(Math.max(asPositiveInt(searchParams.get('pageSize')) || 30, 1), 100);
    const today = new Date(new Date().toISOString().slice(0, 10));
    const where = { classId: schoolClass.id, status: 'ACTIVE' };

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          schoolId: true,
          classId: true,
          branchId: true,
          rollNumber: true,
          attendance: { where: { date: today }, select: { status: true }, take: 1 },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { rollNumber: 'asc' },
      }),
      prisma.student.count({ where }),
    ]);

    return NextResponse.json({
      students: students.map((student) => ({
        id: student.id,
        firstName: student.firstName || '',
        middleName: student.middleName || '',
        lastName: student.lastName || '',
        rollNumber: student.rollNumber || 'N/A',
        status: student.attendance[0]?.status || '',
        schoolId: student.schoolId,
        branchId: student.branchId,
        classId: student.classId,
      })),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
      className: `${schoolClass.name}${schoolClass.section ? `-${schoolClass.section}` : ''}`,
      classId: schoolClass.id,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('GET teacher attendance register failed:', error);
    return NextResponse.json({ error: 'Failed to fetch the attendance register.' }, { status: 500 });
  }
}
