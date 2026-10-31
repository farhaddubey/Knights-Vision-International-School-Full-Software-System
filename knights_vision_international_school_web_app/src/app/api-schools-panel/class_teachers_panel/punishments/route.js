import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

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

    // // Verify user is a teacher
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

    // Fetch Punishments
    const punishmentWhere = {
      classId: { in: classIds },
      OR: searchQuery
        ? [
            { title: { contains: searchQuery, mode: "insensitive" } },
            { type: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
            { severity: { contains: searchQuery, mode: "insensitive" } },
            { class: { name: { contains: searchQuery, mode: "insensitive" } } },
            { class: { section: { contains: searchQuery, mode: "insensitive" } } },
          ]
        : undefined,
    };

    const [punishments, punishmentCount] = await Promise.all([
      prisma.punishment.findMany({
        where: punishmentWhere,
        include: {
          class: {
            select: { name: true, section: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.punishment.count({ where: punishmentWhere }),
    ]);

    // Fetch StudentBehaviourLogs
    const behaviorLogWhere = {
      student: {
        classId: { in: classIds },
      },
      OR: searchQuery
        ? [
            { type: { contains: searchQuery, mode: "insensitive" } },
            { description: { contains: searchQuery, mode: "insensitive" } },
            { category: { contains: searchQuery, mode: "insensitive" } },
            { student: { class: { name: { contains: searchQuery, mode: "insensitive" } } } },
            { student: { class: { section: { contains: searchQuery, mode: "insensitive" } } } },
            { student: { firstName: { contains: searchQuery, mode: "insensitive" } } },
            { student: { lastName: { contains: searchQuery, mode: "insensitive" } } },
          ]
        : undefined,
    };

    const [behaviorLogs, behaviorLogCount] = await Promise.all([
      prisma.studentBehaviourLog.findMany({
        where: behaviorLogWhere,
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
      prisma.studentBehaviourLog.count({ where: behaviorLogWhere }),
    ]);

    const totalItems = punishmentCount + behaviorLogCount;
    const totalPages = Math.ceil(totalItems / pageSize);

    const formattedPunishments = punishments.map((punishment) => ({
      id: punishment.id,
      classId: punishment.classId,
      className: `${punishment.class.name}${punishment.class.section ? `-${punishment.class.section}` : ""}`,
      title: punishment.title,
      type: punishment.type,
      severity: punishment.severity,
      description: punishment.description,
    }));

    const formattedBehaviorLogs = behaviorLogs.map((log) => ({
      id: log.id,
      classId: log.student.classId,
      className: `${log.student.class.name}${log.student.class.section ? `-${log.student.class.section}` : ""}`,
      title: `${log.student.firstName} ${log.student.lastName} - ${log.type}`,
      type: log.type,
      category: log.category,
      severityLevel: log.severityLevel,
      description: log.description,
      incidentDate: log.incidentDate.toISOString(),
      isResolved: log.isResolved,
      resolvedBy: log.resolvedBy,
      resolvedNote: log.resolvedNote,
      classSubject: log.classSubject ? { name: log.classSubject.subject.name } : null,
      punishment: log.punishment ? { title: log.punishment.title } : null,
    }));

    // Combine and slice for pagination
    const allItems = [
      ...formattedPunishments.map((p) => ({ ...p, type: "punishment" })),
      ...formattedBehaviorLogs.map((b) => ({ ...b, type: "behaviorLog" })),
    ].sort((a, b) => new Date(b.createdAt || b.incidentDate) - new Date(a.createdAt || a.incidentDate));
    const paginatedItems = allItems.slice((page - 1) * pageSize, page * pageSize);

    return NextResponse.json(
      {
        punishments: formattedPunishments,
        behaviorLogs: formattedBehaviorLogs,
        totalPages,
        currentPage: page,
        totalCount: totalItems,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("GET /api/class_teachers_panel/punishments Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch punishments and behavior logs", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}