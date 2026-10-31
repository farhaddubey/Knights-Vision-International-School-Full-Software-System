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

    const classInfo = await prisma.schoolClass.findFirst({
      where: { id: student.classId, schoolId: student.schoolId, branchId: student.branchId },
      select: { name: true, section: true },
    });
    if (!classInfo) {
      return NextResponse.json({ error: "Current class was not found" }, { status: 404 });
    }

    const where = { classId: student.classId };
    const [instructions, totalCount] = await Promise.all([
      prisma.classFoodInstruction.findMany({
        where,
        orderBy: { id: "asc" },
        skip: (currentPage - 1) * size,
        take: size,
        select: {
          id: true, title: true, description: true, foodType: true, timeOfDay: true,
          weekDay: true, frequency: true, mediaUrl: true, suggestedItems: true,
        },
      }),
      prisma.classFoodInstruction.count({ where }),
    ]);

    return NextResponse.json({
      instructions,
      totalPages: Math.ceil(totalCount / size),
      className: `${classInfo.name}${classInfo.section ? ` - ${classInfo.section}` : ""}`,
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student food instructions", error);
    return NextResponse.json({ error: "Failed to fetch food instructions" }, { status: 500 });
  }
}
