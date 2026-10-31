import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);

    const whereClause = {};
    if (classSubjectId) {
      whereClause.classSubjectId = classSubjectId;
    } else {
      whereClause.classSubject = { classId: classInfo.id };
    }

    const books = await prisma.subjectBook.findMany({
      where: whereClause,
      include: {
        classSubject: {
          include: {
            subject: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const formattedBooks = books.map((book) => ({
      id: book.id,
      classSubjectId: book.classSubjectId,
      subject: {
        id: book.classSubject.subject.id,
        name: book.classSubject.subject.name,
      },
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
      createdAt: book.createdAt,
      updatedAt: book.updatedAt,
    }));

    return NextResponse.json({ books: formattedBooks }, { status: 200 });
  } catch (error) {
    console.error(`GET SubjectBooks/${params.className}/subject-books Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch subject books', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { books } = await request.json();

    if (!Array.isArray(books) || books.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty books array' }, { status: 400 });
    }

    const savedBooks = await prisma.$transaction(
      books.map((book) =>
        prisma.subjectBook.create({
          data: {
            classSubjectId: book.classSubjectId,
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
          },
        })
      )
    );

    return NextResponse.json({ books: savedBooks }, { status: 201 });
  } catch (error) {
    console.error(`POST SubjectBooks/${params.className}/subject-books Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create subject books', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}