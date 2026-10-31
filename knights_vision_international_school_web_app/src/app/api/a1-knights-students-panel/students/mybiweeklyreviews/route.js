import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  StudentAuthorizationError,
  requireStudentSession,
} from "@/src/lib/student/sessionAuthorization";

const positiveInteger = (value) => /^\d+$/.test(value || "") && Number(value) > 0;

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { fetch, classSubjectId, period } = Object.fromEntries(request.nextUrl.searchParams);

    if (fetch === "subjects") {
      const classSubjects = await prisma.classSubject.findMany({
        where: { classId: student.classId, schoolId: student.schoolId, branchId: student.branchId },
        include: { subject: { select: { name: true } }, teacher: { select: { username: true } } },
        orderBy: { id: "asc" },
      });
      return NextResponse.json({ classSubjects });
    }

    if (!positiveInteger(classSubjectId)) {
      return NextResponse.json({ error: "A valid classSubjectId is required" }, { status: 400 });
    }
    const scopedClassSubject = await prisma.classSubject.findFirst({
      where: {
        id: Number(classSubjectId),
        classId: student.classId,
        schoolId: student.schoolId,
        branchId: student.branchId,
      },
      select: { id: true },
    });
    if (!scopedClassSubject) {
      return NextResponse.json({ error: "Class subject not found in your current class" }, { status: 404 });
    }

    const where = {
      classSubjectId: scopedClassSubject.id,
      studentReviews: { some: { studentId: student.id } },
    };
    if (period) {
      const dates = /^(\d{4}-\d{2}-\d{2})-(\d{4}-\d{2}-\d{2})$/.exec(period);
      if (!dates) {
        return NextResponse.json({ error: "Invalid period format (YYYY-MM-DD-YYYY-MM-DD)" }, { status: 400 });
      }
      where.startDate = { gte: new Date(`${dates[1]}T00:00:00.000Z`) };
      where.endDate = { lte: new Date(`${dates[2]}T23:59:59.999Z`) };
    }

    const reviews = await prisma.biWeeklyHomeworkReview.findMany({
      where,
      include: {
        reviewedBy: { select: { username: true } },
        studentReviews: {
          where: { studentId: student.id },
          include: { student: { select: { firstName: true, lastName: true } } },
        },
      },
      orderBy: { startDate: "desc" },
    });
    return NextResponse.json({
      reviews: reviews.map((review) => ({
        ...review,
        reviewedBy: review.reviewedBy
          ? { ...review.reviewedBy, name: review.reviewedBy.username || "School" }
          : null,
      })),
    });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student bi-weekly reviews", error);
    return NextResponse.json({ error: "Failed to fetch bi-weekly reviews" }, { status: 500 });
  }
}
