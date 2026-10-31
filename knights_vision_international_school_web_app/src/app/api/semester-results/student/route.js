import { NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = parseInt(searchParams.get('schoolId'), 10);
    const branchId = parseInt(searchParams.get('branchId'), 10);
    const classId = parseInt(searchParams.get('classId'), 10);
let rollNumber = searchParams.get('rollNumber') || '';
rollNumber = rollNumber.trim().replace(/^\+/, ''); // Remove leading + if any

    if (!schoolId || !branchId || !classId || !rollNumber) {
      console.log(`DEBUG: Missing parameters: schoolId=${schoolId}, branchId=${branchId}, classId=${classId}, rollNumber=${rollNumber}`);
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    // Fetch student
    const student = await prisma.student.findFirst({
      where: {
        schoolId,
        branchId,
        classId,
        rollNumber,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        admissionNumber: true,
        guardianName: true,
        studentCategory: true,
        class: {
          select: {
            name: true,
            section: true,
            branch: { select: { name: true } },
          },
        },
      },
    });

    if (!student) {
      console.log(`DEBUG: Student not found for rollNumber=${rollNumber}, classId=${classId}, branchId=${branchId}, schoolId=${schoolId}`);
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Fetch class subjects
    const classSubjects = await prisma.classSubject.findMany({
      where: { classId, schoolId, branchId },
      include: {
        subject: { select: { id: true, name: true } },
      },
        orderBy: {
    subject: {
      name: 'asc'
    }
  }
    });

    if (!classSubjects.length) {
      console.log(`DEBUG: No class subjects found for classId=${classId}`);
      return NextResponse.json({ error: 'No subjects found for this class' }, { status: 404 });
    }

    // Fetch semester results for all semesters
    const semesters = ['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'];
    const resultsBySemester = await Promise.all(
      semesters.map(async (semester) => {
        const results = await prisma.semesterResult.findMany({
          where: {
            studentId: student.id,
            classId,
            semester,
          },
          include: {
            classSubject: {
              include: {
                subject: { select: { id: true, name: true }, 
            },
              },
              
            },
            
          },
        });
        return {
          semester,
          results: results.map((result) => ({
            id: result.id,
            classSubjectId: result.classSubjectId,
            subject: {
              id: result.classSubject.subject.id,
              name: result.classSubject.subject.name,
            },
            semesterExamMarks: result.semesterExamMarks || 0,
            vivaMarks: result.vivaMarks || 0,
            internalMarks: result.internalMarks || 0,
            totalMarks: result.totalMarks || 0,
            remarks: result.remarks || null,
          })),
        };
      })
    );

    console.log(`DEBUG: Fetched student and results for rollNumber=${rollNumber}`);
    return NextResponse.json({
      student,
      classSubjects,
      resultsBySemester,
    }, { status: 200 });
  } catch (error) {
    console.error('GET /api/semester-results/student Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch student results', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}