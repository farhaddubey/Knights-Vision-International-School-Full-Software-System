import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT token to get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      userId = parseInt(decoded.id);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Find the class where the user is the class teacher
    const assignedClass = await prisma.schoolClass.findFirst({
      where: {
        classTeacherId: userId,
      },
      select: {
        id: true,
        name: true,
        section: true,
      },
    });

    if (!assignedClass) {
      return NextResponse.json({ error: 'No class assigned to this teacher' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const today = new Date().toISOString().slice(0, 10);

    const where = {
      classId: assignedClass.id,
      status: 'ACTIVE',
    };

    const [students, totalCount] = await Promise.all([
      prisma.student.findMany({
        where,
        include: {
          class: true,
          attendance: {
            where: { date: new Date(today) },
            select: { status: true },
            take: 1,
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber || 'N/A',
      status: student.attendance[0]?.status || 'ABSENT',
    }));

    return NextResponse.json(
      {
        students: formattedStudents,
        totalPages,
        currentPage: page,
        totalCount,
        className: `${assignedClass.name}${assignedClass.section ? `-${assignedClass.section}` : ''}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET /api/class_teachers_panel Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { studentId } = params;
    const { status, date } = await request.json();
    const token = request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Decode JWT token to get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
      userId = parseInt(decoded.id);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Verify the user is a teacher and assigned to a class
    const assignedClass = await prisma.schoolClass.findFirst({
      where: {
        classTeacherId: userId,
      },
      select: {
        id: true,
        schoolId: true,
        branchId: true,
      },
    });

    if (!assignedClass) {
      return NextResponse.json({ error: 'No class assigned to this teacher' }, { status: 403 });
    }

    if (!studentId || !status || !date) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the student belongs to the teacher's assigned class
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) },
      select: { classId: true },
    });

    if (!student || student.classId !== assignedClass.id) {
      return NextResponse.json({ error: 'Student not in assigned class' }, { status: 403 });
    }

    const parsedDate = new Date(date);
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        studentId_date: {
          studentId: parseInt(studentId),
          date: parsedDate,
        },
      },
    });

    let attendance;
    if (existingAttendance) {
      attendance = await prisma.attendance.update({
        where: {
          studentId_date: {
            studentId: parseInt(studentId),
            date: parsedDate,
          },
        },
        data: {
          status,
          updatedAt: new Date(),
        },
      });
    } else {
      attendance = await prisma.attendance.create({
        data: {
          studentId: parseInt(studentId),
          classId: assignedClass.id,
          branchId: assignedClass.branchId,
          schoolId: assignedClass.schoolId,
          date: parsedDate,
          status,
        },
      });
    }

    return NextResponse.json({ attendance, message: 'Attendance updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('POST /api/class_teachers_panel Error:', error.message);
    return NextResponse.json({ error: 'Failed to update attendance', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}