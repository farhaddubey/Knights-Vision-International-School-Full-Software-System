import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function positiveInteger(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

// Legacy-compatible endpoint retained for older Student App builds. Identity
// and current-class scope come only from the verified student session.
export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const params = request.nextUrl.searchParams;
    const requestedClassSubjectId = params.get("classSubjectId");

    if (requestedClassSubjectId) {
      const classSubjectId = positiveInteger(requestedClassSubjectId, 0);
      if (!classSubjectId) {
        return NextResponse.json({ error: "Invalid class subject" }, { status: 400 });
      }

      const scopedClassSubject = await prisma.classSubject.findFirst({
        where: {
          id: classSubjectId,
          classId: student.classId,
          schoolId: student.schoolId,
          branchId: student.branchId,
        },
        select: { id: true },
      });
      if (!scopedClassSubject) {
        return NextResponse.json(
          { error: "Class subject not found in your current class" },
          { status: 404 },
        );
      }

      const books = await prisma.subjectBook.findMany({
        where: { classSubjectId: scopedClassSubject.id },
        orderBy: { id: "asc" },
      });
      return NextResponse.json({ books });
    }

    const page = positiveInteger(params.get("page"), 1);
    const pageSize = Math.min(positiveInteger(params.get("pageSize"), 10), 100);
    const searchQuery = (params.get("searchQuery") || "").trim();
    const where = {
      classId: student.classId,
      schoolId: student.schoolId,
      branchId: student.branchId,
      ...(searchQuery
        ? {
            OR: [
              { subject: { name: { contains: searchQuery, mode: "insensitive" } } },
              { subject: { description: { contains: searchQuery, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        include: { subject: { select: { name: true, description: true } } },
        orderBy: { id: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.classSubject.count({ where }),
    ]);

    return NextResponse.json({
      classSubjects,
      totalPages: Math.max(1, Math.ceil(totalCount / pageSize)),
      currentPage: page,
      totalCount,
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student mysubjectbooks failed:", error);
    return NextResponse.json(
      { error: "Unable to fetch subject books." },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";
