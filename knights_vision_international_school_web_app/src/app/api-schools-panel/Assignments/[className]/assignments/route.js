import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma'; // Singleton Prisma client

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const classSubjectId = parseInt(searchParams.get('classSubjectId'));
  console.log(classSubjectId); 
  console.log(classSubjectId); 
  console.log(classSubjectId); 
  console.log(classSubjectId); 
  console.log(classSubjectId); 
  if (isNaN(classSubjectId)) {
    return NextResponse.json({ error: 'Invalid classSubjectId' }, { status: 400 });
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: { classSubjectId },
      orderBy: { dueDate: 'asc' },
    });

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('GET /assignments error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function POST(request, { params }) {
  try {
    const { className } = params;
    const body = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Dynamically calculate the current academic year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth(); // 0-11 (Jan-Dec)
    const currentYear = currentDate.getFullYear();
    const academicYear = currentMonth >= 3 ? currentYear : currentYear - 1;

    // Handle single assignment creation
    if (!body.classSubjects) {
      const { classSubjectId, classId, branchId, schoolId, subjectId, title, description, dueDate, biWeeklySlotStart, biWeeklySlotEnd } = body;

      if (!classSubjectId || !classId || !branchId || !schoolId || !subjectId || !title || !description || !dueDate || !biWeeklySlotStart || !biWeeklySlotEnd) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Validate classId corresponds to className and academicYear
      const classRecord = await prisma.class.findFirst({
        where: {
          id: classId,
          name: className.toUpperCase(),
          branchId,
          academicYear,
        },
      });

      if (!classRecord) {
        return NextResponse.json({ error: 'Invalid classId for the specified class name' }, { status: 400 });
      }

      const students = await prisma.student.findMany({ where: { classId } });

      const assignment = await prisma.assignment.create({
        data: {
          classSubjectId,
          classId,
          branchId,
          schoolId,
          subjectId,
          title,
          description,
          dueDate: new Date(dueDate),
          biWeeklySlotStart: new Date(biWeeklySlotStart),
          biWeeklySlotEnd: new Date(biWeeklySlotEnd),
          StudentAssignment: {
            create: students.map((student) => ({
              studentId: student.id,
              isSubmitted: false,
            })),
          },
        },
        include: { StudentAssignment: true },
      });

      return NextResponse.json({ assignment }, { status: 201 });
    }

    // Handle batch assignment creation
    const { classSubjects } = body;

    if (!Array.isArray(classSubjects) || classSubjects.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty classSubjects array' }, { status: 400 });
    }

    const assignments = await prisma.$transaction(
      classSubjects.map((cs) =>
        prisma.assignment.create({
          data: {
            classSubjectId: cs.classSubjectId,
            classId: cs.classId,
            branchId: cs.branchId,
            schoolId: cs.schoolId,
            subjectId: cs.subjectId,
            title: cs.title,
            description: cs.description,
            dueDate: new Date(cs.dueDate),
            biWeeklySlotStart: new Date(cs.biWeeklySlotStart),
            biWeeklySlotEnd: new Date(cs.biWeeklySlotEnd),
            StudentAssignment: {
              create: async () => {
                const students = await prisma.student.findMany({ where: { classId: cs.classId } });
                return students.map((student) => ({
                  studentId: student.id,
                  isSubmitted: false,
                }));
              },
            },
          },
          include: { StudentAssignment: true },
        })
      )
    );

    return NextResponse.json({ assignments }, { status: 201 });
  } catch (error) {
    console.error(`POST Assignments/${params.className}/assignments Error:`, error);
    return NextResponse.json({ error: 'Failed to create assignment(s)', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}