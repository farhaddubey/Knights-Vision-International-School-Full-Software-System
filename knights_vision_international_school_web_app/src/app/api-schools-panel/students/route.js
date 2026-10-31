import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { buildScopeWhere, hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';
import { formatStudentAdmissionNumber } from '@/src/lib/students/admissionNumbers';

export async function GET(req) {
  try {
    const authorization = await requirePanelPermission(req, 'student.read');
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const students = await prisma.student.findMany({
      where: buildScopeWhere(authorization, { schoolId: 'schoolId', branchId: 'branchId', classId: 'classId' }),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        class: { select: { name: true, section: true } },
                feeScheme: { select: { id: true, monthlyFee: true, category: true } },
      },
    });

    const total = await prisma.student.count({
      where: buildScopeWhere(authorization, { schoolId: 'schoolId', branchId: 'branchId', classId: 'classId' }),
    });
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ students, totalPages }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}


export async function POST(req) {
  try {
    const authorization = await requirePanelPermission(req, 'student.manage');

    const data = await req.json();

    const schoolId = Number(data.schoolId);
    const branchId = Number(data.branchId);
    const classId = Number(data.classId);
    if (![schoolId, branchId, classId].every((id) => Number.isInteger(id) && id > 0)) {
      return NextResponse.json({ error: 'schoolId, branchId, and classId are required.' }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, { schoolId, branchId, classId })) {
      return NextResponse.json({ error: 'You cannot create a student outside your assigned school scope.' }, { status: 403 });
    }

    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
      select: { schoolId: true, branchId: true, academicYear: true },
    });
    if (!schoolClass || schoolClass.schoolId !== schoolId || schoolClass.branchId !== branchId) {
      return NextResponse.json({ error: 'The selected class does not belong to the supplied school and branch.' }, { status: 400 });
    }

    // Safely assign data
    const academicYear = schoolClass.academicYear;
    const studentData = {
      // Browser input is never trusted for a permanent student identifier.
      // It is assigned immediately after the immutable Student.id exists.
      admissionNumber: null,
      firstName: data.firstName,
      middleName: data.middleName || null,
      lastName: data.lastName,
      gender: data.gender || 'Unknown',
      dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
      admissionDate: data.admissionDate ? new Date(data.admissionDate) : new Date(),
      rollNumber: data.rollNumber || null,
      status: data.status || 'ACTIVE',
      schoolId,
      branchId,
      classId,
      bloodGroup: data.bloodGroup || null,
      nationality: data.nationality || null,
      religion: data.religion || null,
      casteCategory: data.casteCategory || null,
      profileImageUrl: data.profileImageUrl || null,
      academicYear,
    };

    const student = await prisma.$transaction(async (tx) => {
      const created = await tx.student.create({ data: studentData });
      const admissionNumber = formatStudentAdmissionNumber(created.id, academicYear);
      return tx.student.update({
        where: { id: created.id },
        data: {
          admissionNumber,
          rollNumber: created.rollNumber || admissionNumber,
        },
      });
    });

    return NextResponse.json({ student }, { status: 201 });

  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST Error:", error.message);
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 });
  }
}
