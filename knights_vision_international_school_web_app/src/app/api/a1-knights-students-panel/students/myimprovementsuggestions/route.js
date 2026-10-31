import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

const validCategories = new Set([
  "DISCIPLINE", "UNIFORM", "SYLLABUS", "HOMEWORK", "TEACHER_BEHAVIOR",
  "CLEANLINESS", "TRANSPORT", "EXTRACURRICULAR", "TIMETABLE", "OTHER",
]);

function pageValue(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function errorResponse(error, action) {
  if (error instanceof StudentAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error(`Student improvement suggestion ${action}`, error);
  return NextResponse.json({ error: `Failed to ${action} improvement suggestions` }, { status: 500 });
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { page = "1", pageSize = "10" } = Object.fromEntries(request.nextUrl.searchParams);
    const currentPage = pageValue(page, 1);
    const size = Math.min(pageValue(pageSize, 10), 100);
    const where = { studentId: student.id };
    const [suggestions, totalCount] = await Promise.all([
      prisma.improvementSuggestion.findMany({
        where,
        include: { student: { select: { firstName: true, lastName: true } } },
        orderBy: { id: "asc" },
        skip: (currentPage - 1) * size,
        take: size,
      }),
      prisma.improvementSuggestion.count({ where }),
    ]);
    return NextResponse.json({ suggestions, totalPages: Math.ceil(totalCount / size) });
  } catch (error) {
    return errorResponse(error, "fetch");
  }
}

export async function POST(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { category, message, month, year } = await request.json();
    const monthNumber = Number(month);
    const yearNumber = Number(year);
    if (!validCategories.has(category) || typeof message !== "string" || !message.trim() || message.trim().length > 2000) {
      return NextResponse.json({ error: "Provide a valid category and a suggestion of up to 2,000 characters." }, { status: 400 });
    }
    if (!Number.isInteger(monthNumber) || monthNumber < 1 || monthNumber > 12 || !Number.isInteger(yearNumber) || yearNumber < 2020 || yearNumber > 2100) {
      return NextResponse.json({ error: "Provide a valid month and year." }, { status: 400 });
    }

    const existingSuggestion = await prisma.improvementSuggestion.findFirst({
      where: { studentId: student.id, month: monthNumber, year: yearNumber, submittedBy: "STUDENT" },
      select: { id: true },
    });
    if (existingSuggestion) {
      return NextResponse.json({ error: "Suggestion already submitted for this month" }, { status: 409 });
    }

    const suggestion = await prisma.improvementSuggestion.create({
      data: {
        studentId: student.id,
        classId: student.classId,
        branchId: student.branchId,
        schoolId: student.schoolId,
        submittedBy: "STUDENT",
        month: monthNumber,
        year: yearNumber,
        category,
        message: message.trim(),
        visibleToAdmin: true,
      },
    });
    return NextResponse.json({ suggestion }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "submit");
  }
}
