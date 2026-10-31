import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

const validClassNames = [
  "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X",
  "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ"
];

const transformToString = (obj) => {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === "bigint" || typeof obj === "number") return obj.toString();
  if (Array.isArray(obj)) return obj.map(transformToString);
  if (typeof obj === "object") {
    const result = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = transformToString(obj[key]);
      }
    }
    return result;
  }
  return obj;
};

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);
    const academicYear = parseInt(searchParams.get("academicYear"), 10);
    const branchId = parseInt(searchParams.get("branchId") || "1", 10);

    // Validate className
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: "Invalid class name" }, { status: 400 });
    }

    // Validate academicYear
    if (!academicYear || isNaN(academicYear)) {
      return NextResponse.json({ error: "Invalid academic year" }, { status: 400 });
    }

    // Find classId based on className, branchId, and academicYear
    const classRecord = await prisma.schoolClass.findFirst({
      where: {
        name: className.toUpperCase(),
        branchId,
        academicYear,
      },
      select: { id: true },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "Class not found" }, { status: 404 });
    }

    const whereClause = {
      classId: classRecord.id,
      // branchId, // Not needed unless SemesterExamSchedule has a direct branchId field
      // academicYear, // Not needed unless SemesterExamSchedule has an academicYear field
    };

    const [schedules, total, school] = await Promise.all([
      prisma.semesterExamSchedule.findMany({
        where: whereClause,
        include: {
          classSubject: {
            include: {
              subject: { select: { name: true } },
            },
          },
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { examDate: "asc" },
      }),
      prisma.semesterExamSchedule.count({ where: whereClause }),
      prisma.school.findFirst({
        where: { branches: { some: { id: branchId } } },
        select: { name: true },
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    const formattedSchedules = schedules.map((schedule) => ({
      ...schedule,
      subjectName: schedule.classSubject.subject.name,
    }));

    return NextResponse.json({
      schedules: transformToString(formattedSchedules),
      totalPages,
      schoolName: school?.name || "Sure Success Point School",
    }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/semester-exam-schedules/class/${params.className} Error:`, error);
    return NextResponse.json({ error: "Failed to fetch schedules", detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}