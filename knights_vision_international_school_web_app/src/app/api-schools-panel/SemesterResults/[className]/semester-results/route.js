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







export async function POST(request, { params }) {
  try {
    console.log('DEBUG: Entering POST /api/SemesterResults/[className]/semester-results');
    const { className } = await params;
    console.log(`DEBUG: className = ${className}`);

    const { results } = await request.json();
    console.log('DEBUG: Parsed request body', JSON.stringify(results, null, 2));

    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    console.log(`DEBUG: Authorization token = ${token || 'none'}`);
    if (!token) {
      console.log('DEBUG: No token provided');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log(`DEBUG: Validating results array, length = ${results.length}`);
    if (!Array.isArray(results) || results.length === 0) {
      console.log('DEBUG: Results array is invalid or empty');
      return NextResponse.json({ error: 'Invalid or empty results array' }, { status: 400 });
    }

    console.log('DEBUG: Starting input validation for results');
    for (const r of results) {
      console.log(`DEBUG: Validating result = ${JSON.stringify(r)}`);
      if (!r.studentId || !r.classSubjectId || !r.semester || !r.classId || !r.subjectId) {
        console.log('DEBUG: Missing required fields in result');
        return NextResponse.json({ error: 'Missing required fields in results' }, { status: 400 });
      }
      if (!['SEMESTER_I', 'SEMESTER_II', 'SEMESTER_III'].includes(r.semester)) {
        console.log(`DEBUG: Invalid semester: ${r.semester}`);
        return NextResponse.json({ error: `Invalid semester: ${r.semester}` }, { status: 400 });
      }
      if (r.semesterExamMarks < 0 || r.semesterExamMarks > 70) {
        console.log(`DEBUG: Invalid semesterExamMarks: ${r.semesterExamMarks}`);
        return NextResponse.json({ error: `Invalid semesterExamMarks: ${r.semesterExamMarks}` }, { status: 400 });
      }
      if (r.vivaMarks < 0 || r.vivaMarks > 6) {
        console.log(`DEBUG: Invalid vivaMarks: ${r.vivaMarks}`);
        return NextResponse.json({ error: `Invalid vivaMarks: ${r.vivaMarks}` }, { status: 400 });
      }
      if (r.internalMarks < 0 || r.internalMarks > 24) {
        console.log(`DEBUG: Invalid internalMarks: ${r.internalMarks}`);
        return NextResponse.json({ error: `Invalid internalMarks: ${r.internalMarks}` }, { status: 400 });
      }
    }
    console.log('DEBUG: Input validation passed');

    console.log('DEBUG: Starting Prisma transaction');
    const savedResults = await prisma.$transaction(
      results.map((r, index) => {
        console.log(`DEBUG: Processing result ${index + 1}/${results.length}`);
        return prisma.semesterResult.upsert({
          where: {
            studentId_classSubjectId_semester: {
              studentId: r.studentId,
              classSubjectId: r.classSubjectId,
              semester: r.semester,
            },
          },
          update: {
            semesterExamMarks: parseFloat(r.semesterExamMarks) || 0,
            vivaMarks: parseFloat(r.vivaMarks) || 0,
            internalMarks: parseFloat(r.internalMarks) || 0,
            totalMarks: parseFloat(r.totalMarks) || 0,
            remarks: r.remarks || null,
            updatedAt: new Date(),
          },
          create: {
            studentId: r.studentId,
            classSubjectId: r.classSubjectId,
            classId: r.classId,
            branchId: r.branchId,
            schoolId: r.schoolId,
            subjectId: r.subjectId,
            semester: r.semester,
            semesterExamMarks: parseFloat(r.semesterExamMarks) || 0,
            vivaMarks: parseFloat(r.vivaMarks) || 0,
            internalMarks: parseFloat(r.internalMarks) || 0,
            totalMarks: parseFloat(r.totalMarks) || 0,
            remarks: r.remarks || null,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
      })
    );
    console.log('DEBUG: Prisma transaction completed', JSON.stringify(savedResults, null, 2));

    console.log('DEBUG: Sending success response');
    return NextResponse.json({ results: savedResults, message: 'Results saved successfully' }, { status: 201 });
  } catch (error) {
    console.error(`DEBUG: POST SemesterResults/${(await params).className}/semester-results Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create/update semester results', detail: error.message }, { status: 500 });
  } finally {
    console.log('DEBUG: Disconnecting Prisma client');
    await prisma.$disconnect();
  }
}