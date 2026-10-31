import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const classId = parseInt(searchParams.get('classId'), 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    
    const whereClause = {
      occasion: { classId },
      student: { name: { contains: searchQuery, mode: 'insensitive' } },
    };

    const [submissions, total] = await Promise.all([
      prisma.publicSpeechSubmission.findMany({
        where: whereClause,
        include: { student: true, occasion: true },
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.publicSpeechSubmission.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ submissions, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyPublicSpeechSubmissions/${params.className}/submissions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch submissions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { submissions } = await request.json();

    const classMap = {
      'v': { id: 4, name: 'Class V' },
      'vi': { id: 5, name: 'Class VI' },
      'vii': { id: 6, name: 'Class VII' },
      'viii': { id: 7, name: 'Class VIII' },
      'ix': { id: 8, name: 'Class IX' },
      'x': { id: 9, name: 'Class X' },
    };

    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty submissions array' }, { status: 400 });
    }

    // Validate that all submissions reference occasions with the correct classId
    const occasionIds = submissions.map((s) => s.occasionId);
    const occasions = await prisma.publicSpeakingOccasion.findMany({
      where: { id: { in: occasionIds }, classId: classInfo.id },
      select: { id: true },
    });
    const validOccasionIds = new Set(occasions.map((o) => o.id));
    if (submissions.some((s) => !validOccasionIds.has(s.occasionId))) {
      return NextResponse.json({ error: 'One or more occasions do not belong to the specified class' }, { status: 400 });
    }

    const savedSubmissions = await prisma.$transaction(
      submissions.map((submission) =>
        prisma.publicSpeechSubmission.create({
          data: {
            studentId: submission.studentId,
            occasionId: submission.occasionId,
            title: submission.title,
            language: submission.language,
            youtubeLink: submission.youtubeLink || null,
            facebookLink: submission.facebookLink || null,
            instagramLink: submission.instagramLink || null,
            youtubeViews: 0,
            facebookViews: 0,
            instagramViews: 0,
            isFirstPlaceYouTube: false,
            isFirstPlaceInstagram: false,
            isFirstPlaceFacebook: false,
            submittedAt: new Date(),
            approvedByTeacherId: submission.approvedByTeacherId,
          },
        })
      )
    );

    return NextResponse.json({ submissions: savedSubmissions }, { status: 201 });
  } catch (error) {
    console.error(`POST MonthlyPublicSpeechSubmissions/${params.className}/submissions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create submissions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}