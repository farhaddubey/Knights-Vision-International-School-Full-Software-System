import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);
    const month = searchParams.get('month');
    const studentId = parseInt(searchParams.get('studentId'), 10);

    if (!classSubjectId || !month || !studentId) {
      return NextResponse.json({ error: 'Missing classSubjectId, month, or studentId' }, { status: 400 });
    }

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

    if (!schoolId || !branchId) {
      return NextResponse.json({ error: 'School ID or Branch ID not found in token' }, { status: 400 });
    }

    console.log(`Query Parameters: classSubjectId=${classSubjectId}, month=${month}, studentId=${studentId}, schoolId=${schoolId}, branchId=${branchId}`);

    const [year, monthIndex] = month.split('-').map(Number);
    const startDate = new Date(year, monthIndex - 1, 1);
    const endDate = new Date(year, monthIndex, 0);
    const daysInMonth = endDate.getDate();

    console.log(`Date Range: startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

    // Fetch classSubject
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      select: { subjectId: true, schoolId: true, branchId: true, classId: true },
    });

    if (!classSubject) {
      return NextResponse.json({ error: 'ClassSubject not found' }, { status: 404 });
    }

    if (classSubject.schoolId !== schoolId || classSubject.branchId !== branchId) {
      return NextResponse.json({ error: 'Unauthorized access to this class subject' }, { status: 403 });
    }

    console.log(`ClassSubject: ${JSON.stringify(classSubject)}`);

    // Fetch student
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { firstName: true, lastName: true, schoolId: true, branchId: true, classId: true },
    });

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (student.schoolId !== schoolId || student.branchId !== branchId || student.classId !== classSubject.classId) {
      return NextResponse.json({ error: 'Unauthorized access to this student or student not in class' }, { status: 403 });
    }

    console.log(`Student: ${JSON.stringify(student)}`);

    // Fetch homework records
    const homeworkRecords = await prisma.dailyHomeworkCompletion.findMany({
      where: {
        subjectId: classSubject.subjectId,
        studentId,
        schoolId,
        branchId,
        date: {
          gte: new Date(`${year}-${monthIndex.toString().padStart(2, '0')}-01`),
          lte: new Date(`${year}-${monthIndex.toString().padStart(2, '0')}-${daysInMonth}`),
        },
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: { date: 'asc' },
    });

    console.log('Fetched Homework Records:', homeworkRecords);

    // Build response with all days
    const recordsByDate = {};
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      recordsByDate[dateStr] = { date: new Date(dateStr), status: 'PENDING' };
    }

    homeworkRecords.forEach((record) => {
      const dateStr = record.date.toISOString().slice(0, 10);
      recordsByDate[dateStr] = { date: record.date, status: record.status };
    });

    return NextResponse.json({
      homeworkRecords: Object.values(recordsByDate),
      studentName: `${student.firstName} ${student.lastName}`,
    }, { status: 200 });
  } catch (error) {
    console.error('GET Individual Homework Report Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch individual homework report', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}