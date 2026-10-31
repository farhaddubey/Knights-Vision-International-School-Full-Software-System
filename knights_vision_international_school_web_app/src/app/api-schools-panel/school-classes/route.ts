import {  NextResponse, NextRequest } from "next/server";
import prisma from '@/src/lib/prisma';
import { buildScopeWhere, hasScopeAccess, PanelAuthorizationError, requirePanelPermission } from '@/src/lib/rbac/authorization';
import { eligibleClassTeacherForScope } from '@/src/lib/rbac/classTeacherEligibility';
const transformToString = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'bigint' || typeof obj === 'number') return obj.toString();
  if (Array.isArray(obj)) return obj.map(transformToString);
  if (typeof obj === 'object') {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = transformToString(obj[key]);
      }
    }
    return result;
  }
  return obj;
};


export async function GET(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, 'class.read');
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    const skip = (page - 1) * pageSize;
    const scopeWhere = buildScopeWhere(authorization, { schoolId: 'schoolId', branchId: 'branchId', classId: 'id' });

    const classes = await prisma.schoolClass.findMany({
      where: scopeWhere,
      skip,
      take: pageSize,
      include: {
        branch: { select: { name: true } },
        classTeacher: { select: { id: true, username: true } },
      },
    });

    const totalClasses = await prisma.schoolClass.count({
      where: scopeWhere,
    });

    const transformedClasses = transformToString(classes);

    return NextResponse.json({
      classes: transformedClasses,
      total: totalClasses,
      page,
      pageSize,
      totalPages: Math.ceil(totalClasses / pageSize),
    }, { status: 200 });
  } catch (error: any) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch classes' }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, 'class.manage');

    const data = await req.json();
    const classes = Array.isArray(data) ? data : [data];

    if (classes.length === 0) {
      return NextResponse.json({ error: 'At least one class entry is required' }, { status: 400 });
    }

    const { schoolId, branchId, academicYear } = classes[0];
    if (!schoolId || !branchId || !academicYear) {
      return NextResponse.json({ error: 'School ID, Branch ID, and Academic Year are required' }, { status: 400 });
    }

    const hasInvalidFields = classes.some((classItem) => (
      classItem.schoolId !== schoolId ||
      classItem.branchId !== branchId ||
      classItem.academicYear !== academicYear ||
      !classItem.name ||
      classItem.name.length > 20 ||
      (classItem.section && classItem.section.length > 5) ||
      (classItem.roomNumber && classItem.roomNumber.length > 50)
    ));

    if (hasInvalidFields) {
      return NextResponse.json({ error: 'All classes must share the same School ID, Branch ID, and Academic Year, and fields must meet length constraints' }, { status: 400 });
    }

    if (!classes.every((classItem) => hasScopeAccess(authorization, {
      schoolId: Number(classItem.schoolId),
      branchId: Number(classItem.branchId),
    }))) {
      return NextResponse.json({ error: 'You cannot create classes outside your assigned school scope.' }, { status: 403 });
    }

    // Validate real branch ownership and class-teacher eligibility before the
    // batch insert. A staff duty such as GCI/AIC may be assigned, but only
    // when its active RBAC scope covers the selected school and branch.
    for (const classItem of classes) {
      const numericSchoolId = Number(classItem.schoolId);
      const numericBranchId = Number(classItem.branchId);
      const branch = await prisma.schoolBranch.findFirst({
        where: { id: numericBranchId, schoolId: numericSchoolId },
        select: { id: true },
      });
      if (!branch) {
        return NextResponse.json({ error: `The selected branch does not belong to the selected school for class ${classItem.name}.` }, { status: 400 });
      }
      if (classItem.classTeacherId != null && classItem.classTeacherId !== '') {
        const teacherId = Number(classItem.classTeacherId);
        if (!Number.isInteger(teacherId) || teacherId <= 0) {
          return NextResponse.json({ error: `classTeacherId is invalid for class ${classItem.name}.` }, { status: 400 });
        }
        const teacher = await eligibleClassTeacherForScope(prisma, teacherId, {
          schoolId: numericSchoolId,
          branchId: numericBranchId,
          classId: null,
        });
        if (!teacher) {
          return NextResponse.json({ error: `The selected class teacher is not eligible for ${classItem.name} in this school and branch.` }, { status: 400 });
        }
      }
    }

    // Check unique constraint
    const uniqueCheck = new Set();
    for (const classItem of classes) {
      const uniqueKey = `${classItem.schoolId}-${classItem.branchId}-${classItem.name}-${classItem.section || ''}-${classItem.academicYear}`;
      if (uniqueCheck.has(uniqueKey)) {
        return NextResponse.json({ error: `Duplicate class entry: ${classItem.name} (${classItem.section || 'N/A'})` }, { status: 400 });
      }
      uniqueCheck.add(uniqueKey);

      const existingClass = await prisma.schoolClass.findFirst({
        where: {
          schoolId: parseInt(classItem.schoolId),
          branchId: parseInt(classItem.branchId),
          name: classItem.name,
          section: classItem.section || null,
          academicYear: parseInt(classItem.academicYear),
        },
      });
      if (existingClass) {
        return NextResponse.json({ error: `Class ${classItem.name} (${classItem.section || 'N/A'}) already exists for this school, branch, and academic year` }, { status: 400 });
      }
    }

    const classData = classes.map((classItem) => ({
      branchId: parseInt(classItem.branchId),
      schoolId: parseInt(classItem.schoolId),
      name: classItem.name,
      section: classItem.section || null,
      roomNumber: classItem.roomNumber || null,
      academicYear: parseInt(classItem.academicYear),
      classTeacherId: classItem.classTeacherId ? parseInt(classItem.classTeacherId) : null,
    }));

    const createdClasses = await prisma.schoolClass.createMany({
      data: classData,
    });

    const transformedClasses = transformToString(classData);

    return NextResponse.json({
      message: 'Classes created successfully',
      classes: transformedClasses,
      count: createdClasses.count,
    }, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('POST Error:', error.message);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create classes' }, { status: 500 });
  }
}
