import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function pageValue(value, fallback, maximum) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) return fallback;
  return Math.min(number, maximum);
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const page = pageValue(request.nextUrl.searchParams.get("page"), 1, 10_000);
    const pageSize = pageValue(request.nextUrl.searchParams.get("pageSize"), 30, 100);
    const classInfo = await prisma.schoolClass.findFirst({
      where: { id: student.classId, schoolId: student.schoolId, branchId: student.branchId },
      select: { name: true, section: true },
    });
    if (!classInfo) {
      return NextResponse.json({ error: "Current class was not found" }, { status: 404 });
    }

    const where = { schoolId: student.schoolId, classId: student.classId };
    const [totalSchedules, schedules, school] = await Promise.all([
      prisma.semesterExamSchedule.count({ where }),
      prisma.semesterExamSchedule.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true, classSubjectId: true, classId: true, subjectId: true, schoolId: true,
          semester: true, examDate: true, durationMinutes: true, examHall: true,
          classSubject: { select: { class: { select: { name: true, section: true } }, subject: { select: { name: true } } } },
        },
        orderBy: { examDate: "asc" },
      }),
      prisma.school.findUnique({ where: { id: student.schoolId }, select: { name: true } }),
    ]);

    return NextResponse.json({
      schedules: schedules.map((schedule) => ({
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
      })),
      totalPages: Math.ceil(totalSchedules / pageSize),
      schoolName: school?.name || "Sure Success Point School",
      className: `${classInfo.name}${classInfo.section ? ` - ${classInfo.section}` : ""}`,
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student semester exam schedules", error);
    return NextResponse.json({ error: "Failed to fetch schedules" }, { status: 500 });
  }
}
