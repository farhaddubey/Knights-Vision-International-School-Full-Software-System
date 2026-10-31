import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const className = searchParams.get('className');
    const month = parseInt(searchParams.get('month'), 10); // 1-12 (January-December)
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const schoolId = parseInt(searchParams.get('schoolId'), 10);
    const branchId = parseInt(searchParams.get('branchId'), 10);

    if (!className || !month || !academicYear || !schoolId || !branchId) {
      return NextResponse.json(
        { error: 'Class name, month, academicYear, schoolId, and branchId are required' },
        { status: 400 }
      );
    }

    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Authentication token is missing or invalid' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication token is missing' },
        { status: 401 }
      );
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    if (decodedToken.schoolId !== schoolId || decodedToken.branchId !== branchId) {
      return NextResponse.json(
        { error: 'Unauthorized access to this school or branch' },
        { status: 403 }
      );
    }

    console.log(`Query Parameters: className=${className}, month=${month}, academicYear=${academicYear}, schoolId=${schoolId}, branchId=${branchId}`);

    // Calculate date range for the month
    const startDate = new Date(academicYear, month - 1, 1);
    const endDate = new Date(academicYear, month, 0);

    console.log(`Date Range: startDate=${startDate.toISOString()}, endDate=${endDate.toISOString()}`);

    // Fetch students for the class
    const students = await prisma.student.findMany({
      where: {
        class: { name: className, schoolId, branchId },
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
      orderBy: { id: 'asc' },
    });

    // Fetch class subjects
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        class: { name: className, schoolId, branchId },
      },
      select: {
        id: true,
        subject: { select: { name: true } },
      },
      orderBy: { id: 'asc' },
    });

    // Fetch board exams for the month and academic year
    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubject: {
          class: { name: className, schoolId, branchId },
        },
        academicYear,
        examDate: {
          gte: startDate,
          lte: endDate,
        },
      },
      select: {
        id: true,
        classSubjectId: true,
        title: true,
        BoardExamResult: {
          select: {
            studentId: true,
            totalMarks: true,
          },
        },
      },
    });

    console.log(`Board Exams: ${JSON.stringify(boardExams.map(e => ({ id: e.id, title: e.title })))}`);

    // Organize results
    const studentRecords = students.map((student) => ({
      studentId: student.id,
      studentName: `${student.firstName} ${student.middleName || ''} ${student.lastName}`.trim(),
      marks: {},
      percentage: 0,
      grade: 'F',
    }));

    // Map classSubjectId to subject name for easier lookup
    const subjectMap = classSubjects.reduce((acc, cs) => ({
      ...acc,
      [cs.id]: cs.subject.name,
    }), {});

    // Populate marks
    boardExams.forEach((exam) => {
      exam.BoardExamResult.forEach((result) => {
        const studentRecord = studentRecords.find((s) => s.studentId === result.studentId);
        if (studentRecord && subjectMap[exam.classSubjectId]) {
          studentRecord.marks[exam.classSubjectId] = result.totalMarks;
        }
      });
    });

    // Calculate percentage and grade
    studentRecords.forEach((record) => {
      const marks = Object.values(record.marks);
      const totalMarks = marks.reduce((sum, mark) => sum + (mark || 0), 0);
      const maxMarks = classSubjects.length * 100; // 100 marks per subject
      record.percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;
      record.percentage = parseFloat(record.percentage.toFixed(2));
      record.grade = calculateGrade(record.percentage);
    });

    return NextResponse.json({
      students: studentRecords,
      subjects: classSubjects.map((cs) => ({
        classSubjectId: cs.id,
        subjectName: cs.subject.name,
      })),
    }, { status: 200 });
  } catch (error) {
    console.error('GET Monthly Board Exam Results Error:', error.message);
    if (error.name === 'JsonWebTokenError') {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    return NextResponse.json(
      { error: 'Failed to fetch monthly board exam results', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

function calculateGrade(percentage) {
  if (percentage >= 90) return 'AA';
  if (percentage >= 80) return 'A+';
  if (percentage >= 70) return 'A';
  if (percentage >= 60) return 'B';
  if (percentage >= 50) return 'C';
  return 'F';
}