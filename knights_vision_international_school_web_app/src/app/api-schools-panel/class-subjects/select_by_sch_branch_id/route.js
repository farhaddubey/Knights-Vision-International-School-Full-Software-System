import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { schoolId, branchId } = jwt.verify(token, process.env.JWT_SECRET);

    const classSubjects = await prisma.classSubject.findMany({
      where: { schoolId, branchId },
      select: {
        id: true,
        class: { select: { name: true, section: true } },
        subject: { select: { name: true } },
      },
    });

    return NextResponse.json(classSubjects, { status: 200 });
  } catch (error) {
    console.error('GET /api/class-subjects/select Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch class subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}