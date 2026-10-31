import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';


export async function PUT(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop(), 10);
    const body = await req.json();
    const { date, title } = body;

    if (!date || !title) {
      return new Response(JSON.stringify({ error: 'Date and title are required' }), { status: 400 });
    }

    const holiday = await prisma.holidayCalendar.update({
      where: { id },
      data: {
        date: new Date(date),
        title,
      },
    });

    return new Response(JSON.stringify(holiday), { status: 200 });
  } catch (error) {
    console.error('PUT /api/holidays Error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to update holiday' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    }

    const url = new URL(req.url);
    const id = parseInt(url.pathname.split('/').pop(), 10);

    await prisma.holidayCalendar.delete({
      where: { id },
    });

    return new Response(JSON.stringify({ message: 'Holiday deleted successfully' }), { status: 200 });
  } catch (error) {
    console.error('DELETE /api/holidays Error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to delete holiday' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}