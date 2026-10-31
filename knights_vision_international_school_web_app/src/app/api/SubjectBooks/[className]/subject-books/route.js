import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);

    const books = await prisma.subjectBook.findMany({
      where:{classSubjectId:  classSubjectId},
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

export async function DELETE(request, { params }) {
  const { className } = params;
  const { searchParams } = new URL(request.url);
  const bookId = searchParams.get('bookId');

  try {
    await prisma.subjectBook.delete({
      where: { id: parseInt(bookId) },
    });
    return new Response(JSON.stringify({ message: 'Book deleted successfully' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error deleting book:', error);
    return new Response(JSON.stringify({ error: 'Failed to delete book' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}