import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
const jwt = require('jsonwebtoken');

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);
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

    const where = {
      classSubjectId,
      schoolId,
      branchId,
      date: new Date(date),
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
        date: record.date,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('GET Homework Status Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to fetch homework statuses', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const {
      studentId,
      classId,
      subjectId,
      branchId,
      schoolId,
      status,
      date,
    } = await request.json();

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!studentId || !classId || !subjectId || !branchId || !schoolId || !status || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const validStatuses = ['PENDING', 'SUBMITTED', 'LATE', 'MISSING', 'NEEDS_IMPROVEMENT', 'EXCELLENT'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const parsedDate = new Date(date);
    const existingRecord = await prisma.dailyHomeworkCompletion.findUnique({
      where: {
        studentId_classId_subjectId_date: {
          studentId: parseInt(studentId),
          classId: parseInt(classId),
          subjectId: parseInt(subjectId),
          date: parsedDate,
        },
      },
    });

    let homework;
    if (existingRecord) {
      homework = await prisma.dailyHomeworkCompletion.update({
        where: {
          studentId_classId_subjectId_date: {
            studentId: parseInt(studentId),
            classId: parseInt(classId),
            subjectId: parseInt(subjectId),
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
          classId: parseInt(classId),
          subjectId: parseInt(subjectId),
          branchId: parseInt(branchId),
          schoolId: parseInt(schoolId),
          date: parsedDate,
          status,
        },
      });
    }

    return NextResponse.json({ homework, message: "Homework status updated successfully" }, { status: 200 });
  } catch (error) {
    console.error('POST Homework Status Error:', error.message);
    return NextResponse.json({ error: "Failed to update homework status", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}