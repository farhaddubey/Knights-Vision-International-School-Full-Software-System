import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import jwt from "jsonwebtoken";

export async function GET(request) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Decode JWT token to get user ID
    let userId;
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
      userId = parseInt(decoded.id);
    } catch (err) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    // Verify user is a teacher
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    // if (user?.role !== "TEACHER") {
    //   return NextResponse.json({ error: "User is not a teacher" }, { status: 403 });
    // }

    // Find the class where the user is the class teacher
    const assignedClass = await prisma.schoolClass.findFirst({
      where: {
        classTeacherId: userId,
        academicYear: new Date().getFullYear(), // Ensure current academic year
      },
      select: {
        id: true,
        name: true,
        section: true,
      },
    });

    if (!assignedClass) {
      return NextResponse.json({ error: "No class assigned to this teacher" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);
    const today = new Date().toISOString().slice(0, 10);

    const where = {
      classId: assignedClass.id,
      status: "ACTIVE",
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
        orderBy: { createdAt: "desc" },
      }),
      prisma.student.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const formattedStudents = students.map((student) => ({
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      rollNumber: student.rollNumber || "N/A",
      status: student.attendance[0]?.status || "ABSENT",
    }));

    return NextResponse.json(
      {
        students: formattedStudents,
        totalPages,
        currentPage: page,
        totalCount,
        className: `${assignedClass.name}${assignedClass.section ? `-${assignedClass.section}` : ""}`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/class_teachers_panel Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch students", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}