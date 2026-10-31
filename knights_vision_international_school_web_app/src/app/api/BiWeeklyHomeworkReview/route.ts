import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// Get all
export async function GET() {
  const allReviews = await prisma.biWeeklyHomeworkReview.findMany({
    include: {
      classSubject: true,
      reviewedBy: true,
      studentReviews: true,
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return NextResponse.json(allReviews);
}

// Create new
export async function POST(req: Request) {
  const data = await req.json();

  try {
    const created = await prisma.biWeeklyHomeworkReview.create({
      data: {
        classSubjectId: data.classSubjectId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reviewedById: data.reviewedById,
        generalRemarks: data.generalRemarks ?? null,
        suggestions: data.suggestions ?? null,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create review", detail: error }, { status: 500 });
  }
}



// GET one | PUT update | DELETE review by ID
// export async function GET(_: Request, { params }: { params: { id: string } }) {
//   const id = parseInt(params.id);
//   const review = await prisma.biWeeklyHomeworkReview.findUnique({
//     where: { id },
//     include: {
//       classSubject: true,
//       reviewedBy: true,
//       studentReviews: true,
//     },
//   });

//   if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
//   return NextResponse.json(review);
// }

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);
  const data = await req.json();

  try {
    const updated = await prisma.biWeeklyHomeworkReview.update({
      where: { id },
      data: {
        classSubjectId: data.classSubjectId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        reviewedById: data.reviewedById,
        generalRemarks: data.generalRemarks ?? null,
        suggestions: data.suggestions ?? null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Update failed", detail: error }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const id = parseInt(params.id);

  try {
    const deleted = await prisma.biWeeklyHomeworkReview.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    return NextResponse.json({ error: "Deletion failed", detail: error }, { status: 500 });
  }
}
