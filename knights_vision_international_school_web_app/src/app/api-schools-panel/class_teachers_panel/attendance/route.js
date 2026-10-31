import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hasScopeAccess,
  PanelAuthorizationError,
  requireFacultyPermission,
} from '@/src/lib/rbac/authorization';

const allowedStatuses = new Set(['PRESENT', 'ABSENT', 'HOLIDAY', 'WEEKLY_HOLIDAY']);

function asPositiveInt(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function dateOnly(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request) {
  try {
    const authorization = await requireFacultyPermission(request, 'attendance.manage');
    const payload = await request.json();
    const studentId = asPositiveInt(payload.studentId);
    const schoolId = asPositiveInt(payload.schoolId);
    const branchId = asPositiveInt(payload.branchId);
    const classId = asPositiveInt(payload.classId);
    const attendanceDate = dateOnly(payload.date);
    const status = typeof payload.status === 'string' ? payload.status.toUpperCase() : '';

    if (!studentId || !schoolId || !branchId || !classId || !attendanceDate || !allowedStatuses.has(status)) {
      return NextResponse.json({ error: 'studentId, schoolId, branchId, classId, a YYYY-MM-DD date, and a valid attendance status are required.' }, { status: 400 });
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true, status: true },
    });
    if (!student || student.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Active student not found.' }, { status: 404 });
    }
    if (student.schoolId !== schoolId || student.branchId !== branchId || student.classId !== classId) {
      return NextResponse.json({ error: 'Student school, branch, or class does not match the submitted attendance record.' }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, student)) {
      return NextResponse.json({ error: 'You do not have access to record attendance for this student.' }, { status: 403 });
    }

    const attendance = await prisma.attendance.upsert({
      where: { studentId_date: { studentId, date: attendanceDate } },
      update: { status },
      create: { studentId, schoolId, branchId, classId, date: attendanceDate, status },
    });
    return NextResponse.json({ attendance, message: 'Attendance updated successfully.' }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST teacher attendance failed:', error);
    return NextResponse.json({ error: 'Failed to update attendance.' }, { status: 500 });
  }
}
