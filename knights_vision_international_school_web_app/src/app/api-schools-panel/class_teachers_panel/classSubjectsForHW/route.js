import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Authentication token is missing or invalid' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ error: 'Authentication token is missing' }, { status: 401 });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    const schoolId = decodedToken.schoolId;
    const branchId = decodedToken.branchId;
    const teacherId = decodedToken.id;

    if (!schoolId || !branchId || !teacherId) {
      return NextResponse.json({ error: 'School ID, Branch ID, or Teacher ID not found in token' }, { status: 400 });
    }

    const currentDate = new Date();
    const academicYear = currentDate.getMonth() >= 3 ? currentDate.getFullYear() : currentDate.getFullYear() - 1;

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where: {
          schoolId,
          branchId,
          teacherId,
          class: { academicYear },
        },
        include: {
          class: { select: { name: true, section: true } },
          subject: { select: { name: true } },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.classSubject.count({
        where: {
          schoolId,
          branchId,
          teacherId,
          class: { academicYear },
        },
      }),
    ]);

    const formattedClassSubjects = classSubjects.map((cs) => ({
      id: cs.id,
      classId: cs.classId,
      className: `${cs.class.name}-${cs.class.section}`,
      subjectId: cs.subjectId,
      subject: { name: cs.subject.name },
    }));

    return NextResponse.json({
      classSubjects: formattedClassSubjects,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
      totalCount,
    }, { status: 200 });
  } catch (error) {
    console.error('GET Class Subjects Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch class subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}