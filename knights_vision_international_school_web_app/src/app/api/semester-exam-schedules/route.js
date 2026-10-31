import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';
import jwt from "jsonwebtoken";

const transformToString = (obj) => {
  console.log("DEBUG: Transforming object to string:", JSON.stringify(obj, null, 2));
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

export async function GET(request) {
  console.log("DEBUG: Handling GET /api/semester-exam-schedules request...");
  try {
    // Verify token
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      console.error("DEBUG: No token provided");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schoolId } = jwt.verify(token, process.env.JWT_SECRET);
    console.log("DEBUG: Decoded token:", { schoolId });

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(searchParams.get("pageSize") || "30", 10);
    const className = searchParams.get("className");
    const filterSchoolId = parseInt(searchParams.get("schoolId")) || schoolId;

    console.log("DEBUG: Query parameters:", { page, pageSize, className, schoolId: filterSchoolId });

    // Build where clause
    const where = { schoolId: filterSchoolId };

    console.log("DEBUG: Prisma query where clause:", JSON.stringify(where, null, 2));

    // Count total schedules
    const totalSchedules = await prisma.semesterExamSchedule.count({ where });
    console.log("DEBUG: Total schedules count:", totalSchedules);

    // Fetch schedules
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

    console.log("DEBUG: Fetched schedules:", JSON.stringify(schedules, null, 2));

    // Format schedules
    const formattedSchedules = schedules.map((schedule) => ({
      id: schedule.id,
      classSubjectId: schedule.classSubjectId,
      classId: schedule.classId,
      subjectId: schedule.subjectId,
      schoolId: schedule.schoolId,
      semester: schedule.semester,
      examDate: schedule.examDate.toISOString(),
      durationMinutes: schedule.durationMinutes,
      examHall: schedule.examHall || "",
      className: `${schedule.classSubject.class.name}${schedule.classSubject.class.section ? ` - ${schedule.classSubject.class.section}` : ""}`,
      subjectName: schedule.classSubject.subject.name,
    }));

    console.log("DEBUG: Formatted schedules:", JSON.stringify(formattedSchedules, null, 2));

    // Fetch school name
    const school = await prisma.school.findFirst({
      where: { id: filterSchoolId },
      select: { name: true },
    });

    return NextResponse.json(
      transformToString({
        schedules: formattedSchedules,
        totalPages: Math.ceil(totalSchedules / pageSize),
        schoolName: school?.name || "Unknown School",
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("DEBUG: GET /api/semester-exam-schedules Error:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to fetch schedules", detail: error.message }, { status: 500 });
  } finally {
    console.log("DEBUG: Disconnecting Prisma client...");
    await prisma.$disconnect();
  }
}



export async function POST(request) {
  console.log("DEBUG: Handling POST /api/semester-exam-schedules request...");
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { schoolId } = jwt.verify(token, process.env.JWT_SECRET);
    const payload = await request.json();

    if (!Array.isArray(payload)) {
      console.error("DEBUG: Payload is not an array:", payload);
      return NextResponse.json({ error: "Payload must be an array" }, { status: 400 });
    }

    const errors = [];
    const createdSchedules = [];

    for (const entry of payload) {
      console.log("DEBUG: Validating payload entry:", JSON.stringify(entry, null, 2));
      const { classSubjectId, classId, subjectId, semester, examDate, durationMinutes, examHall } = entry;

      if (!classSubjectId || !classId || !subjectId || !semester || !examDate || !durationMinutes || !schoolId) {
        errors.push(`Missing required fields for schedule: ${JSON.stringify(entry)}`);
        continue;
      }

      // Validate classSubjectId, classId, and subjectId
      const classSubject = await prisma.classSubject.findUnique({
        where: { id: parseInt(classSubjectId) },
        select: { classId: true, subjectId: true, schoolId: true },
      });

      if (!classSubject) {
        errors.push(`Invalid classSubjectId: ${classSubjectId}`);
        continue;
      }

      if (
        classSubject.classId !== parseInt(classId) ||
        classSubject.subjectId !== parseInt(subjectId) ||
        classSubject.schoolId !== parseInt(schoolId)
      ) {
        errors.push(`Mismatch in classSubjectId: ${classSubjectId} with classId: ${classId}, subjectId: ${subjectId}, or schoolId: ${schoolId}`);
        continue;
      }

      // Check for duplicates
      const existingSchedule = await prisma.semesterExamSchedule.findFirst({
        where: { classSubjectId: parseInt(classSubjectId), semester, schoolId: parseInt(schoolId) },
      });

      if (existingSchedule) {
        errors.push(`Schedule already exists for classSubjectId: ${classSubjectId}, semester: ${semester}`);
        continue;
      }

      const newSchedule = await prisma.semesterExamSchedule.create({
        data: {
          classSubjectId: parseInt(classSubjectId),
          classId: parseInt(classId),
          subjectId: parseInt(subjectId),
          schoolId: parseInt(schoolId),
          semester,
          examDate: new Date(examDate),
          durationMinutes: parseInt(durationMinutes),
          examHall: examHall || null,
        },
      });

      createdSchedules.push(newSchedule);
    }

    if (errors.length > 0) {
      console.log("DEBUG: Errors occurred during schedule creation:", errors);
      return NextResponse.json({ message: "Some schedules could not be created", errors, createdSchedules }, { status: 207 });
    }

    console.log("DEBUG: Created schedules:", createdSchedules);
    return NextResponse.json(transformToString({ schedules: createdSchedules }), { status: 201 });
  } catch (error) {
    console.error("DEBUG: POST /api/semester-exam-schedules Error:", error.message, error.stack);
    return NextResponse.json({ error: "Failed to create schedules", detail: error.message }, { status: 500 });
  } finally {
    console.log("DEBUG: Disconnecting Prisma client...");
    await prisma.$disconnect();
  }
}