import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    console.log(`DEBUG: Fetching semester results for className=${className}`);

    const { searchParams } = new URL(request.url);
    const studentId = parseInt(searchParams.get('studentId'), 10);
    const semester = searchParams.get('semester');

    if (!studentId || !semester) {
      console.log(`DEBUG: Missing studentId=${studentId} or semester=${semester}`);
      return NextResponse.json({ error: 'Missing studentId or semester' }, { status: 400 });
    }
    if (!['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'].includes(semester)) {
      console.log(`DEBUG: Invalid semester: ${semester}`);
      return NextResponse.json({ error: `Invalid semester: ${semester}` }, { status: 400 });
    }

    // Fetch the student's class to get classId
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { classId: true },
    });

    if (!student) {
      console.log(`DEBUG: Student not found for studentId=${studentId}`);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch all ClassSubject records for the student's class
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: student.classId },
      select: { id: true },
    });

    const classSubjectIds = classSubjects.map(cs => cs.id);

    if (!classSubjectIds.length) {
      console.log(`DEBUG: No class subjects found for classId=${student.classId}`);
      return NextResponse.json({ error: 'No subjects found for this class' }, { status: 404 });
    }

    // Fetch semester results for all class subjects
    const results = await prisma.semesterResult.findMany({
      where: {
        studentId,
        classSubjectId: { in: classSubjectIds },
        semester,
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            rollNumber: true,
          },
        },
        classSubject: {
          include: {
            subject: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    const formattedResults = results.map((result) => ({
      id: result.id,
      studentId: result.studentId,
      student: {
        firstName: result.student.firstName,
        lastName: result.student.lastName,
        rollNumber: result.student.rollNumber || 'N/A',
      },
      classSubjectId: result.classSubjectId,
      subject: {
        id: result.classSubject.subject.id,
        name: result.classSubject.subject.name,
      },
      classId: result.classId,
      branchId: result.branchId,
      schoolId: result.schoolId,
      subjectId: result.subjectId,
      semester: result.semester,
      semesterExamMarks: result.semesterExamMarks || 0,
      vivaMarks: result.vivaMarks || 0,
      internalMarks: result.internalMarks || 0,
      totalMarks: result.totalMarks || 0,
      remarks: result.remarks || null,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
    }));

    console.log(`DEBUG: Fetched ${results.length} results for studentId=${studentId}, semester=${semester}`);
    return NextResponse.json({ results: formattedResults }, { status: 200 });
  } catch (error) {
    console.error(`GET SemesterResults/${(await params).className}/semester-results Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch semester results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
