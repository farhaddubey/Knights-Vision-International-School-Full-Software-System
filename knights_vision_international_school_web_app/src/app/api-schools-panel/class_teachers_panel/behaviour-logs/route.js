import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

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
    // const user = await prisma.user.findUnique({
    //   where: { id: userId },
    //   select: { role: true },
    // });
    // if (user?.role !== "TEACHER") {
    //   return NextResponse.json({ error: "User is not a teacher" }, { status: 403 });
    // }

    // Fetch classes where the user is the class teacher
    const classes = await prisma.schoolClass.findMany({
      where: {
        classTeacherId: userId,
        academicYear: new Date().getFullYear(),
      },
      select: { id: true, name: true, section: true },
    });

    if (!classes.length) {
      return NextResponse.json({ error: "No classes assigned to this teacher" }, { status: 403 });
    }

    const classIds = classes.map((c) => c.id);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
    const searchQuery = searchParams.get("searchQuery") || "";

    const where = {
      student: {
        classId: { in: classIds },
      },
      OR: searchQuery
        ? [
            { type: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
            { category: { contains: searchQuery, mode: "insensitive" } },
            { student: { firstName: { contains: searchQuery, mode: "insensitive" } } },
            { student: { lastName: { contains: searchQuery, mode: "insensitive" } } },
            { student: { class: { name: { contains: searchQuery, mode: "insensitive" } } } },
            { student: { class: { section: { contains: searchQuery, mode: "insensitive" } } } },
          ]
        : undefined,
    };

    const [behaviourLogs, totalCount] = await Promise.all([
      prisma.studentBehaviourLog.findMany({
        where,
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              class: {
                select: { name: true, section: true },
              },
            },
          },
          classSubject: {
            select: {
              subject: { select: { name: true } },
            },
          },
          punishment: {
            select: { title: true },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { incidentDate: "desc" },
      }),
      prisma.studentBehaviourLog.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    const formattedBehaviourLogs = behaviourLogs.map((log) => ({
      id: log.id,
      classId: log.student.classId,
      className: `${log.student.class.name}${log.student.class.section ? `-${log.student.class.section}` : ""}`,
      student: {
        id: log.studentId,
        name: `${log.student.firstName} ${log.student.lastName}`,
      },
      category: log.category,
      type: log.type,
      description: log.description,
      severityLevel: log.severityLevel,
      incidentDate: log.incidentDate.toISOString(),
      isResolved: log.isResolved,
      resolvedBy: log.resolvedBy,
      resolvedNote: log.resolvedNote,
      classSubject: log.classSubject ? { name: log.classSubject.subject.name } : null,
      punishment: log.punishment ? { title: log.punishment.title } : null,
    }));

    return NextResponse.json(
      {
        behaviourLogs: formattedBehaviourLogs,
        totalPages,
        currentPage: page,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/class_teachers_panel/behaviour-logs Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch behaviour logs", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}