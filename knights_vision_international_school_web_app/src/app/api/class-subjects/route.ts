import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import { authorizationErrorResponse, buildScopeWhere, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

// Utility function to convert BigInt and numbers to strings in nested objects and arrays
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
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const where = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const classSubjects = await prisma.classSubject.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
        teacher: { select: { username: true } },
      },
    });

    const total = await prisma.classSubject.count({ where });
    const totalPages = Math.ceil(total / pageSize);

    // Transform response to convert BigInt and numbers to strings
    const transformedClassSubjects = transformToString(classSubjects);

    return NextResponse.json(
      { classSubjects: transformedClassSubjects, totalPages },
      { status: 200 }
    );
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
    const classSubjects = Array.isArray(data) ? data : [data];

    // Validate input
    if (classSubjects.length === 0) {
      return NextResponse.json({ error: 'At least one class-subject assignment is required' }, { status: 400 });
    }

    // Validate all entries share the same schoolId and branchId
    const { schoolId, branchId } = classSubjects[0];
    if (!schoolId || !branchId) {
      return NextResponse.json({ error: 'School ID and Branch ID are required' }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, { schoolId: Number(schoolId), branchId: Number(branchId) })) {
      return NextResponse.json({ error: 'You do not have access to this school and branch.' }, { status: 403 });
    }

    const hasInvalidFields = classSubjects.some((item) => (
      item.schoolId !== schoolId ||
      item.branchId !== branchId ||
      !item.classId ||
      !item.subjectId ||
      !item.teacherId
    ));

    if (hasInvalidFields) {
      return NextResponse.json({ error: 'All assignments must share the same School ID and Branch ID, and include Class ID, Subject ID, and Teacher ID' }, { status: 400 });
    }

    // Check for unique constraint violations
    const uniqueCheck = new Set();
    for (const item of classSubjects) {
      const uniqueKey = `${item.classId}-${item.subjectId}`;
      if (uniqueCheck.has(uniqueKey)) {
        return NextResponse.json({ error: `Duplicate class-subject assignment: Class ID ${item.classId}, Subject ID ${item.subjectId}` }, { status: 400 });
      }
      uniqueCheck.add(uniqueKey);

      // Check existing records in database
      const existing = await prisma.classSubject.findFirst({
        where: {
          classId: parseInt(item.classId),
          subjectId: parseInt(item.subjectId),
        },
      });
      if (existing) {
        return NextResponse.json({ error: `Class-Subject assignment already exists for Class ID ${item.classId}, Subject ID ${item.subjectId}` }, { status: 400 });
      }
    }

    // Prepare data for batch creation
    const classSubjectData = classSubjects.map((item) => ({
      classId: parseInt(item.classId),
      subjectId: parseInt(item.subjectId),
      branchId: parseInt(item.branchId),
      schoolId: parseInt(item.schoolId),
      teacherId: parseInt(item.teacherId),
      syllabus: item.syllabus || { activities: [] },
    }));

    // Create class-subject assignments in batch
    const created = await prisma.classSubject.createMany({
      data: classSubjectData,
    });

    // Transform response to convert BigInt and numbers to strings
    const transformedData = transformToString(classSubjectData);

    return NextResponse.json(
      {
        message: 'Class-Subject assignments created successfully',
        classSubjects: transformedData,
        count: created.count,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class-Subject assignment already exists' }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, "class.manage");

    const data = await req.json();
    const classSubjects = Array.isArray(data) ? data : [data];

    // Validate input
    if (classSubjects.length === 0) {
      return NextResponse.json({ error: 'At least one class-subject assignment is required' }, { status: 400 });
    }

    // Validate all entries share the same schoolId and branchId
    const { schoolId, branchId } = classSubjects[0];
    if (!schoolId || !branchId) {
      return NextResponse.json({ error: 'School ID and Branch ID are required' }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, { schoolId: Number(schoolId), branchId: Number(branchId) })) {
      return NextResponse.json({ error: 'You do not have access to this school and branch.' }, { status: 403 });
    }

    const hasInvalidFields = classSubjects.some((item) => (
      item.schoolId !== schoolId ||
      item.branchId !== branchId ||
      !item.id ||
      !item.classId ||
      !item.subjectId ||
      !item.teacherId
    ));

    if (hasInvalidFields) {
      return NextResponse.json({ error: 'All assignments must share the same School ID and Branch ID, and include ID, Class ID, Subject ID, and Teacher ID' }, { status: 400 });
    }

    // Check for unique constraint violations
    const uniqueCheck = new Set();
    for (const item of classSubjects) {
      const uniqueKey = `${item.classId}-${item.subjectId}`;
      if (uniqueCheck.has(uniqueKey)) {
        return NextResponse.json({ error: `Duplicate class-subject assignment: Class ID ${item.classId}, Subject ID ${item.subjectId}` }, { status: 400 });
      }
      uniqueCheck.add(uniqueKey);

      // Check existing records for conflicts (excluding the current ID)
      const existing = await prisma.classSubject.findFirst({
        where: {
          classId: parseInt(item.classId),
          subjectId: parseInt(item.subjectId),
          id: { not: parseInt(item.id) },
        },
      });
      if (existing) {
        return NextResponse.json({ error: `Class-Subject assignment already exists for Class ID ${item.classId}, Subject ID ${item.subjectId}` }, { status: 400 });
      }
    }

    // Update class-subject assignments
    const updated = await Promise.all(
      classSubjects.map((item) =>
        prisma.classSubject.update({
          where: { id: parseInt(item.id) },
          data: {
            classId: parseInt(item.classId),
            subjectId: parseInt(item.subjectId),
            branchId: parseInt(item.branchId),
            schoolId: parseInt(item.schoolId),
            teacherId: parseInt(item.teacherId),
            syllabus: item.syllabus || { activities: [] },
          },
        })
      )
    );

    // Transform response to convert BigInt and numbers to strings
    const transformedUpdated = transformToString(updated);

    return NextResponse.json(
      {
        message: 'Class-Subject assignments updated successfully',
        classSubjects: transformedUpdated,
        count: updated.length,
      },
      { status: 200 }
    );
  } catch (error) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Unique constraint violation: Class-Subject assignment already exists' }, { status: 400 });
    }
    return authorizationErrorResponse(error);
  } finally {
    await prisma.$disconnect();
  }
}
