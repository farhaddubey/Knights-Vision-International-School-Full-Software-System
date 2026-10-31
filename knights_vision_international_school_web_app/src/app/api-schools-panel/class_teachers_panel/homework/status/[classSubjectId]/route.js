import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const jwt = require('jsonwebtoken');

export async function GET(request, { params }) {
  try {
    const { classSubjectId } = params;
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const studentId = searchParams.get('studentId') ? parseInt(searchParams.get('studentId'), 10) : null;

    if (!classSubjectId || !date) {
      return NextResponse.json({ error: 'Missing classSubjectId or date' }, { status: 400 });
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

    // Normalize date to YYYY-MM-DD
    const parsedDate = new Date(date).toISOString().slice(0, 10);

    const where = {
      subjectId: parseInt(classSubjectId),
      schoolId,
      branchId,
      date: {
        gte: new Date(parsedDate),
        lte: new Date(parsedDate + 'T23:59:59.999Z'),
      },
    };

    if (studentId) {
      where.studentId = studentId;
    }

    const homeworkRecords = await prisma.dailyHomeworkCompletion.findMany({
      where,
      include: {
        student: {
          select: { id: true, firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({
      homeworkRecords: homeworkRecords.map((record) => ({
        studentId: record.studentId,
        studentName: `${record.student.firstName} ${record.student.lastName}`,
        status: record.status,
        date: record.date.toISOString().slice(0, 10),
      })),
    }, { status: 200 });
  } catch (error) {
    console.error(`GET Homework Status Error for classSubjectId ${params.classSubjectId}:`, error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch homework statuses', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { classSubjectId, studentId } = params;
    const { status, date } = await request.json();

    const validStatuses = ['PENDING', 'SUBMITTED', 'LATE', 'MISSING', 'NEEDS_IMPROVEMENT', 'EXCELLENT'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid homework status' }, { status: 400 });
    }

    if (!classSubjectId || !studentId || !date) {
      return NextResponse.json({ error: 'Missing classSubjectId, studentId, or date' }, { status: 400 });
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

    const classSubject = await prisma.classSubject.findUnique({
      where: { id: parseInt(classSubjectId) },
      select: { classId: true, subjectId: true, schoolId: true, branchId: true },
    });

    if (!classSubject) {
      return NextResponse.json({ error: 'ClassSubject not found' }, { status: 404 });
    }

    if (classSubject.schoolId !== schoolId || classSubject.branchId !== branchId) {
      return NextResponse.json({ error: 'Unauthorized access to this class subject' }, { status: 403 });
    }

    const parsedDate = new Date(date);
    const existingRecord = await prisma.dailyHomeworkCompletion.findUnique({
      where: {
        studentId_subjectId_date: {
          studentId: parseInt(studentId),
          subjectId: classSubject.subjectId,
          date: parsedDate,
        },
      },
    });

    let homework;
    if (existingRecord) {
      homework = await prisma.dailyHomeworkCompletion.update({
        where: {
          studentId_subjectId_date: {
            studentId: parseInt(studentId),
            classId: classSubject.classId,
            subjectId: classSubject.subjectId,
            date: parsedDate,
          },
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    } else {
      homework = await prisma.dailyHomeworkCompletion.create({
        data: {
          studentId: parseInt(studentId),
          classId: classSubject.classId,
          subjectId: classSubject.subjectId,
          branchId: classSubject.branchId,
          schoolId: classSubject.schoolId,
          date: parsedDate,
          status,
        },
      });
    }
    console.log("After Homework is: ", homework); 

    return NextResponse.json({ homework, message: 'Homework status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`POST Homework Status Error for classSubjectId ${params.classSubjectId}, studentId ${params.studentId}:`, error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to update homework status', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}