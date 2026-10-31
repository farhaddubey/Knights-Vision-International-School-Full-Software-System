import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';


export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const teachers = await prisma.user.findMany({
      where: { role: 'TEACHER' },
      select: {
        id: true,
        username: true,
      },
      orderBy: { username: 'asc' },
    });

    return NextResponse.json(teachers, { status: 200 });
  } catch (error) {
    console.error('GET Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch teachers', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}