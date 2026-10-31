import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  console.log("DEBUG: Handling GET /api/semester-exam-schedules/[className] request...");
  console.log("DEBUG: Full params object:", params);

  try {
    const { className } = params;
    console.log("DEBUG: ClassName from params:", className);

    // Validate className
    if (!className) {
      console.error("DEBUG: className is undefined or missing");
      return NextResponse.json({ error: "Missing className in URL" }, { status: 400 });
    }

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      console.error("DEBUG: Invalid className:", className);
      return NextResponse.json({ error: "Invalid className" }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);
    console.log("DEBUG: Query parameters:", { page, pageSize });

    const where = { class: { name: className.toUpperCase() } };
    console.log("DEBUG: Prisma query where clause:", where);

    const totalSchedules = await prisma.semesterExamSchedule.count({ where });
    console.log("DEBUG: Total schedules count:", totalSchedules);

    const schedules = await prisma.semesterExamSchedule.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        classSubjectId: true,
        classId: true,
        subjectId: true,
        schoolId: true,
        semester: true,
        examDate: true,
        durationMinutes: true,
        examHall: true,
        classSubject: {
          select: {
            class: { select: { name: true, section: true } },
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { examDate: "asc" },
    });

    console.log("DEBUG: Fetched schedules:", schedules);

    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      classSubjectId: schedule.classSubjectId,
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      branchId: schedule.branchId,
      schoolId: schedule.schoolId,
      semester: schedule.semester,
      examDate: schedule.examDate.toISOString(),
      durationMinutes: schedule.durationMinutes,
      examHall: schedule.examHall || "",
      className: `${schedule.classSubject.class.name}${schedule.classSubject.class.section ? ` - ${schedule.classSubject.class.section}` : ""}`,
      subjectName: schedule.classSubject.subject.name,
    }));

    console.log("DEBUG: Formatted schedules:", formattedSchedules);

    const school = await prisma.school.findFirst({
      where: { id: schedules[0]?.schoolId },
      select: { name: true },
    });

    return NextResponse.json({
      schedules: formattedSchedules,
      totalPages: Math.ceil(totalSchedules / pageSize),
      schoolName: school?.name || "Sure Success Point School",
    }, { status: 200 });
  } catch (error) {
    console.error("DEBUG: GET /api/semester-exam-schedules/[className] Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch schedules", detail: error.message }, { status: 500 });
  } finally {
    console.log("DEBUG: Disconnecting Prisma client...");
    await prisma.$disconnect();
  }
}