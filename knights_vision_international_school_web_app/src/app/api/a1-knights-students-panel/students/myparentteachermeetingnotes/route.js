import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

function pageValue(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { page = "1", pageSize = "10" } = Object.fromEntries(request.nextUrl.searchParams);
    const currentPage = pageValue(page, 1);
    const size = Math.min(pageValue(pageSize, 10), 100);
    const where = { studentId: student.id, classId: student.classId };

    const [notes, totalCount] = await Promise.all([
      prisma.parentTeacherMeetingNote.findMany({
        where,
        include: {
          student: { select: { firstName: true, lastName: true } },
          class: { select: { name: true } },
        },
        orderBy: { id: "asc" },
        skip: (currentPage - 1) * size,
        take: size,
      }),
      prisma.parentTeacherMeetingNote.count({ where }),
    ]);

    return NextResponse.json({ notes, totalPages: Math.ceil(totalCount / size) });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student parent-teacher meeting notes", error);
    return NextResponse.json({ error: "Failed to fetch parent-teacher meeting notes" }, { status: 500 });
  }
}
