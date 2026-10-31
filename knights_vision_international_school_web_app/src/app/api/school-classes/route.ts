import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { authorizationErrorResponse, buildScopeWhere, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
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
    const authorization = await requirePanelPermission(req, "class.read");
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);
    const skip = (page - 1) * pageSize;

    const where = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "id" });
    const classes = await prisma.schoolClass.findMany({
      where,
      skip,
      take: pageSize,
      include: {
        branch: { select: { name: true } },
        classTeacher: { select: { id: true, username: true } },
      },
    });

    const totalClasses = await prisma.schoolClass.count({ where });

    const transformedClasses = transformToString(classes);

    return NextResponse.json({
      classes: transformedClasses,
      total: totalClasses,
      page,
      pageSize,
      totalPages: Math.ceil(totalClasses / pageSize),
    }, { status: 200 });
  } catch (error) {
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, "class.manage");

    const data = await req.json();
    const classes = Array.isArray(data) ? data : [data];

    if (classes.length === 0) {
      return NextResponse.json({ error: 'At least one class entry is required' }, { status: 400 });
    }

    const { schoolId, branchId, academicYear } = classes[0];
    if (!schoolId || !branchId || !academicYear) {
      return NextResponse.json({ error: 'School ID, Branch ID, and Academic Year are required' }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, { schoolId: Number(schoolId), branchId: Number(branchId) })) {
      return NextResponse.json({ error: 'You do not have access to this school and branch.' }, { status: 403 });
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

    // Validate foreign keys
    // for (const classItem of classes) {
    //   if (!(await prisma.school.findUnique({ where: { id: parseInt(classItem.schoolId) } }))) {
    //     return NextResponse.json({ error: `Invalid schoolId: ${classItem.schoolId}` }, { status: 400 });
    //   }
    //   if (!(await prisma.schoolBranch.findUnique({ where: { id: parseInt(classItem.branchId) } }))) {
    //     return NextResponse.json({ error: `Invalid branchId: ${classItem.branchId}` }, { status: 400 });
    //   }
    //   if (classItem.classTeacherId && !(await prisma.user.findUnique({ where: { id: parseInt(classItem.classTeacherId), role: 'TEACHER' } }))) {
    //     return NextResponse.json({ error: `Invalid classTeacherId: ${classItem.classTeacherId}` }, { status: 400 });
    //   }
    // }

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
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class already exists' }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}
