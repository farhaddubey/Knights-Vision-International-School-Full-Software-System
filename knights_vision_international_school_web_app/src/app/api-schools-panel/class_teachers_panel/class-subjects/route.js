import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  buildScopeWhere,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "class.read");
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(positiveInteger(searchParams.get("pageSize"), 10), 100);
    const requestedClassName = searchParams.get("className")?.trim().toUpperCase() || null;
    const classScopeWhere = buildScopeWhere(authorization, {
      schoolId: "schoolId",
      branchId: "branchId",
      classId: "id",
    });
    const scopedClassWhere = requestedClassName
      ? { AND: [classScopeWhere, { name: requestedClassName }] }
      : classScopeWhere;

    // Coordinators may inspect every subject inside their assigned class/branch.
    // Teaching-only users remain limited to their own subject work or the class
    // explicitly assigned to them as class teacher.
    const teachingOnlyFilter = authorization.permissions.includes("class.manage")
      ? null
      : {
          OR: [
            { teacherId: authorization.user.id },
            { class: { classTeacherId: authorization.user.id } },
          ],
        };
    const where = teachingOnlyFilter
      ? { AND: [{ class: scopedClassWhere }, teachingOnlyFilter] }
      : { class: scopedClassWhere };

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        include: {
          subject: { select: { id: true, name: true } },
          class: { select: { id: true, name: true, section: true, schoolId: true, branchId: true } },
          teacher: { select: { id: true, username: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      }),
      prisma.classSubject.count({ where }),
    ]);

    return NextResponse.json({
      classSubjects: classSubjects.map((classSubject) => ({
        id: classSubject.id,
        classId: classSubject.classId,
        className: `${classSubject.class.name}${classSubject.class.section ? `-${classSubject.class.section}` : ""}`,
        subjectId: classSubject.subjectId,
        subject: { name: classSubject.subject.name },
        teacher: classSubject.teacher ? { name: classSubject.teacher.username } : null,
      })),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET class teacher subjects failed:", error);
    return NextResponse.json({ error: "Failed to fetch class subjects" }, { status: 500 });
  }
}
