import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  const { className } = params;
  const { searchParams } = new URL(request.url);
  const classSubjectId = searchParams.get('classSubjectId');

  try {
    const books = await prisma.subjectBook.findMany({
      where: { classSubjectId: parseInt(classSubjectId) },
    });
    return new Response(JSON.stringify({ books }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching books:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch books' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export async function DELETE(request, { params }) {
  const { className, id } = params;

  try {
    await prisma.subjectBook.delete({
      where: { id: parseInt(id) },
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