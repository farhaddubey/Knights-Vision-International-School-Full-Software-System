import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 
  'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

export async function GET(request, { params }) {
  try {
    // Await params to access className
    const { className } = await params;

    const { searchParams } = new URL(request.url);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const month = parseInt(searchParams.get('month'), 10);
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Validate academicYear and month
    if (!academicYear || isNaN(academicYear)) {
      return NextResponse.json({ error: 'Invalid academic year' }, { status: 400 });
    }
    if (!month || isNaN(month) || month < 1 || month > 12) {
      return NextResponse.json({ error: 'Invalid month' }, { status: 400 });
    }

    // Get class record to fetch its id
    const schoolClass = await prisma.schoolClass.findFirst({
      where: {
        name: className.toUpperCase(),
        branchId,
        academicYear
      },
      select: { id: true },
    });

    if (!schoolClass) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    // Subjects for this class
    const subjects = await prisma.classSubject.findMany({
      where: { classId: schoolClass.id },
      include: { subject: { select: { name: true } } },
    });

    // Students of this class
    const students = await prisma.student.findMany({
      where: {
        classId: schoolClass.id,
      },
      select: {
        id: true,
        firstName: true,
        middleName: true,
        lastName: true,
      },
      orderBy: { firstName: 'asc' },
    });

    // Format student names
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: [student.firstName, student.middleName, student.lastName]
        .filter(Boolean)
        .join(' ')
    }));

    // XS is the January-February continuation of the same academic session.
    const calendarYear = className.toUpperCase() === 'XS' && month <= 2
      ? academicYear + 1
      : academicYear;
    const startDate = new Date(Date.UTC(calendarYear, month - 1, 1));
    const endDate = new Date(Date.UTC(calendarYear, month, 1));

    // Board exams for this class in the specified monthly window.
    const boardExams = await prisma.boardExam.findMany({
      where: {
        classSubjectId: { in: subjects.map((s) => s.id) },
        academicYear,
        examDate: { gte: startDate, lt: endDate },
      },
      include: {
        BoardExamResult: {
          select: {
            studentId: true,
            writtenMarks: true,
            oralMarks: true,
            totalMarks: true,
          },
        },
        classSubject: {
          include: {
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { examDate: 'asc' },
    });

    return NextResponse.json({ subjects, students: formattedStudents, boardExams }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/classes/${className}/board-exam-results/data Error:`, error);
    return NextResponse.json(
      { error: 'Failed to fetch data for PDF', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
