import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(req) {
  try {
    // const token = req.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    // }

    // try {
    //   jwt.verify(token, process.env.JWT_SECRET);
    // } catch (error) {
    //   return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    // }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const pageSize = parseInt(url.searchParams.get('pageSize') || '10', 10);

    const skip = (page - 1) * pageSize;
    const holidays = await prisma.holidayCalendar.findMany({
      skip,
      take: pageSize,
      orderBy: { date: 'asc' },
    });

    const totalHolidays = await prisma.holidayCalendar.count();
    const totalPages = Math.ceil(totalHolidays / pageSize);

    return new Response(JSON.stringify({ holidays, totalPages }), { status: 200 });
  } catch (error) {
    console.error('GET /api/holidays Error:', error.message);
    return new Response(JSON.stringify({ error: 'Failed to fetch holidays' }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(req) {
  try {
    // const token = req.headers.get('authorization')?.replace('Bearer ', '');
    // if (!token) {
    //   return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
    // }

    // try {
    //   jwt.verify(token, process.env.JWT_SECRET);
    // } catch (error) {
    //   return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
    // }

    const body = await req.json();
    const { date, title } = body;

    if (!date || !title) {
      return new Response(JSON.stringify({ error: 'Date and title are required' }), { status: 400 });
    }

    const parsedDate = new Date(date);
    if (isNaN(parsedDate)) {
      return new Response(JSON.stringify({ error: 'Invalid date format' }), { status: 400 });
    }

    if (title.length > 100) {
      return new Response(JSON.stringify({ error: 'Title exceeds 100 characters' }), { status: 400 });
    }


    const holiday = await prisma.holidayCalendar.create({
      data: {
        date: parsedDate,
        title,
      },
    });

    return new Response(JSON.stringify(holiday), { status: 201 });
  } catch (error) {
    console.error('POST /api/holidays Error:', error.message, error.stack);
    return new Response(JSON.stringify({ error: 'Failed to create holiday', detail: error.message }), { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

