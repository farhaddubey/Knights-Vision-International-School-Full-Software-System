import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { schoolId, branchId } = jwt.verify(token, process.env.JWT_SECRET);

    const classes = await prisma.schoolClass.findMany({
      where: { schoolId, branchId },
      select: { id: true, name: true, section: true },
    });

    return NextResponse.json({ classes }, { status: 200 });
  } catch (error) {
    console.error('GET /api/classes Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch classes', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
