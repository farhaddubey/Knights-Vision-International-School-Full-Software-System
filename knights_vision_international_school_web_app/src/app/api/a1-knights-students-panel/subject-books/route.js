import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const classSubjectId = Number(request.nextUrl.searchParams.get("classSubjectId"));
    const requestedClassId = request.nextUrl.searchParams.get("classId");
    if (!Number.isInteger(classSubjectId) || classSubjectId <= 0) {
      return NextResponse.json({ error: "classSubjectId is required" }, { status: 400 });
    }
    if (requestedClassId && Number(requestedClassId) !== student.classId) {
      return NextResponse.json({ error: "Students may access books only for their current class" }, { status: 403 });
    }

    const classSubject = await prisma.classSubject.findFirst({
      where: {
        id: classSubjectId,
        classId: student.classId,
        schoolId: student.schoolId,
        branchId: student.branchId,
      },
      select: { id: true },
    });
    if (!classSubject) {
      return NextResponse.json({ error: "Class subject not found in your current class" }, { status: 404 });
    }

    const books = await prisma.subjectBook.findMany({
      where: { classSubjectId: classSubject.id },
      select: {
        id: true, title: true, author: true, publisher: true, isbn: true,
        edition: true, language: true, bookType: true, downloadUrl: true,
        purchaseUrl: true, studyUrl: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json({ books });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student subject books", error);
    return NextResponse.json({ error: "Failed to fetch books" }, { status: 500 });
  }
}
