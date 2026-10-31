import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    const schoolId = parseInt(searchParams.get('schoolId'), 10);
    const branchId = parseInt(searchParams.get('branchId'), 10);
    const academicYear = parseInt(searchParams.get('academicYear'), 10) || 2025;

    // if (!className || !schoolId || !branchId) {
    //   return NextResponse.json(
    //     { error: 'className, schoolId, and branchId are required' },
    //     { status: 400 }
    //   );
    // }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is missing' },
        { status: 401 }
      );
    }

    // const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    // if (decodedToken.schoolId !== schoolId || decodedToken.branchId !== branchId) {
    //   return NextResponse.json(
    //     { error: 'Unauthorized access to this school or branch' },
    //     { status: 403 }
    //   );
    // }

    // console.log(`Query Parameters: className=${className}, schoolId=${schoolId}, branchId=${branchId}, academicYear=${academicYear}`);

    const classInfo = await prisma.schoolClass.findFirst({
      where: {
        name: className.toUpperCase(),
        // schoolId,
        // branchId,
        academicYear,
      },
      select: { id: true },
    });

    if (!classInfo) {
      return NextResponse.json(
        { error: `Class ${className} not found for schoolId ${schoolId} and branchId ${branchId}` },
        { status: 404 }
      );
    }

    const books = await prisma.subjectBook.findMany({
      where: {
        classSubject: {
          classId: classInfo.id,
        },
      },
      include: {
        classSubject: {
          include: {
            subject: {
              select: { id: true, name: true, description: true },
            },
          },
        },
      },
      orderBy: [
        { classSubject: { subject: { name: 'asc' } } },
        { title: 'asc' },
      ],
    });

    const formattedBooks = books.map((book) => ({
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
    }));

    console.log(`Fetched Books: ${JSON.stringify(formattedBooks.map(b => ({
      subjectName: b.subjectName,
      title: b.title,
    })))}`);

    return NextResponse.json({ books: formattedBooks }, { status: 200 });
  } catch (error) {
    console.error('GET All Subject Books Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch all subject books', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}