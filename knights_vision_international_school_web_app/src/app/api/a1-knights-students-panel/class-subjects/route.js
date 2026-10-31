import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { searchParams } = new URL(request.url);
    const page = positiveInteger(searchParams.get("page"), 1);
    const pageSize = Math.min(positiveInteger(searchParams.get("pageSize"), 10), 100);
    const where = {
      classId: student.classId,
      branchId: student.branchId,
      schoolId: student.schoolId,
    };
    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        select: {
          id: true,
          classId: true,
          subjectId: true,
          subject: { select: { name: true } },
          class: { select: { name: true, section: true } },
          teacher: { select: { username: true } },
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
        subject: classSubject.subject,
        teacher: classSubject.teacher ? { name: classSubject.teacher.username } : null,
      })),
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student class subjects failed:", error);
    return NextResponse.json({ error: "Unable to fetch class subjects." }, { status: 500 });
  }
}
