import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);
    const month = searchParams.get('month');

    if (!classSubjectId || !month) {
      return NextResponse.json({ error: 'Missing classSubjectId or month' }, { status: 400 });
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

    console.log(`Query Parameters: classSubjectId=${classSubjectId}, month=${month}, schoolId=${schoolId}, branchId=${branchId}`);

    const [year, monthIndex] = month.split('-').map(Number);
    const startDate = new Date(`${year}-${monthIndex.toString().padStart(2, '0')}-01`);
    const endDate = new Date(year, monthIndex, 0);
    const daysInMonth = endDate.getDate();

    console.log(`Date Range: startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

    // Fetch classSubject to get classId and subjectId
    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      select: { classId: true, subjectId: true, schoolId: true, branchId: true },
    });

    if (!classSubject) {
      return NextResponse.json({ error: 'ClassSubject not found' }, { status: 404 });
    }

    if (classSubject.schoolId !== schoolId || classSubject.branchId !== branchId) {
      return NextResponse.json({ error: 'Unauthorized access to this class subject' }, { status: 403 });
    }

    console.log(`ClassSubject: ${JSON.stringify(classSubject)}`);

    // Fetch all students in the class
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        branchId,
        classId: classSubject.classId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
      orderBy: { id: 'asc' },
    });

    console.log(`Students: ${JSON.stringify(students.map(s => ({ id: s.id, name: `${s.firstName} ${s.lastName}` })))}`);

    // Fetch homework records
    const homeworkRecords = await prisma.dailyHomeworkCompletion.findMany({
      where: {
        subjectId: classSubject.subjectId,
        schoolId,
        branchId,
        date: {
          gte: startDate,
          lte: new Date(`${year}-${monthIndex.toString().padStart(2, '0')}-${daysInMonth}`),
        },
        studentId: { in: students.map(s => s.id) }, // Ensure only class students are included
      },
      select: {
        studentId: true,
        date: true,
        status: true,
      },
      orderBy: { studentId: 'asc'},
    });

    console.log('Fetched Homework Records:', homeworkRecords);

    // Build response with all students and days
    const studentRecords = {};
    students.forEach((student) => {
      studentRecords[student.id] = {
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        statuses: {},
      };
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${monthIndex.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
        studentRecords[student.id].statuses[dateStr] = 'PENDING';
      }
    });

    // Update statuses from records
    homeworkRecords.forEach((record) => {
      const studentId = record.studentId;
      const dateStr = record.date.toISOString().slice(0, 10);
      if (studentRecords[studentId]) {
        studentRecords[studentId].statuses[dateStr] = record.status;
      }
    });

    return NextResponse.json({
      homeworkRecords: Object.values(studentRecords),
    }, { status: 200 });
  } catch (error) {
    console.error('GET Class Homework Report Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch class homework report', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}