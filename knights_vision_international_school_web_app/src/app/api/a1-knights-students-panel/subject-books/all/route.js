import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const books = await prisma.subjectBook.findMany({
      where: {
        classSubject: {
          classId: student.classId,
          schoolId: student.schoolId,
          branchId: student.branchId,
        },
      },
      include: { classSubject: { include: { subject: { select: { name: true, description: true } } } } },
      orderBy: [{ classSubject: { subject: { name: "asc" } } }, { title: "asc" }],
    });

    return NextResponse.json({
      books: books.map((book) => ({
        id: book.id,
        classSubjectId: book.classSubjectId,
        subjectName: book.classSubject.subject.name,
        subjectDescription: book.classSubject.subject.description || null,
        title: book.title,
        author: book.author || null,
        publisher: book.publisher || null,
        isbn: book.isbn || null,
        edition: book.edition || null,
        language: book.language || null,
        bookType: book.bookType,
        downloadUrl: book.downloadUrl || null,
        purchaseUrl: book.purchaseUrl || null,
        studyUrl: book.studyUrl || null,
      })),
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET all student subject books", error);
    return NextResponse.json({ error: "Failed to fetch all subject books" }, { status: 500 });
  }
}
