import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';


export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classSubjectId = parseInt(searchParams.get('classSubjectId'), 10);

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (!classSubjectId) {
      return NextResponse.json({ error: 'Missing classSubjectId' }, { status: 400 });
    }

    const reviews = await prisma.biWeeklyHomeworkReview.findMany({
      where: {
        classSubjectId,
        classSubject: {
          classId: classInfo.id,
        },
      },
      include: {
        classSubject: { include: { subject: true } },
        reviewedBy: true,
        studentReviews: { include: { student: true } },
      },
      orderBy: { startDate: 'desc' },
    });

    const formattedReviews = reviews.map((r) => ({
      ...r,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate.toISOString(),
    }));

    return NextResponse.json({ reviews: formattedReviews }, { status: 200 });
  } catch (error) {
    console.error(`GET BiWeeklyHomeworkReview/${params.className}/bi-weekly-reviews Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch reviews', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { classSubjectId, startDate, endDate, reviewedById, generalRemarks, suggestions, studentReviews } = await request.json();
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!classSubjectId || !startDate || !endDate || !reviewedById || !Array.isArray(studentReviews)) {
      return NextResponse.json({ error: 'Missing required fields or invalid student reviews' }, { status: 400 });
    }

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const review = await prisma.biWeeklyHomeworkReview.create({
      data: {
        classSubjectId,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reviewedById,
        generalRemarks,
        suggestions,
        studentReviews: {
          create: studentReviews.map((sr) => ({
            studentId: sr.studentId,
            totalTopicsReviewed: sr.totalTopicsReviewed,
            totalHomeworkCompleted: sr.totalHomeworkCompleted,
            completionRate: sr.completionRate,
            status: sr.status,
            remarks: sr.remarks,
          })),
        },
      },
      include: { studentReviews: true },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error(`POST BiWeeklyHomeworkReview/${params.className}/bi-weekly-reviews Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create review', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}