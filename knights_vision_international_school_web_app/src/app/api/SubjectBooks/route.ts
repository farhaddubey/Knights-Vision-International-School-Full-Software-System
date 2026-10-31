import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET() {
  const books = await prisma.subjectBook.findMany({
    include: {
      classSubject: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json(books);
}

export async function POST(req: Request) {
  const data = await req.json();

  try {
    const created = await prisma.subjectBook.create({
      data: {
        classSubjectId: data.classSubjectId,
        title: data.title,
        author: data.author ?? null,
        publisher: data.publisher ?? null,
        isbn: data.isbn ?? null,
        edition: data.edition ?? null,
        language: data.language ?? null,
        bookType: data.bookType ?? "TEXTBOOK",
        downloadUrl: data.downloadUrl ?? null,
        purchaseUrl: data.purchaseUrl ?? null,
        studyUrl: data.studyUrl ?? null,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create SubjectBook", detail: error }, { status: 500 });
  }
}
