import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    const sessionType = searchParams.get('sessionType') || '';

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const whereClause = {
      class: { name: className.toUpperCase() },
      title: { contains: searchQuery, mode: 'insensitive' },
      ...(sessionType && { sessionType }),
    };

    const [sessions, total] = await Promise.all([
      prisma.knightsCdtpSession.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { sessionDate: 'desc' },
      }),
      prisma.knightsCdtpSession.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ sessions, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyKnightsCdtpSessions/${params.className}/sessions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch sessions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const { sessions } = await request.json();

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (!Array.isArray(sessions) || sessions.length === 0) {
      return NextResponse.json({ error: 'Invalid or empty sessions array' }, { status: 400 });
    }

    const savedSessions = await prisma.$transaction(
      sessions.map((session) =>
        prisma.knightsCdtpSession.create({
          data: {
            class: { connect: { name: className.toUpperCase() } },
            schoolId: session.schoolId,
            branchId: session.branchId,
            sessionType: session.sessionType,
            title: session.title,
            content: session.content || null,
            sessionDate: new Date(session.sessionDate),
            videoLink: session.videoLink || null,
            articleLink: session.articleLink || null,
            imageUrl: session.imageUrl || null,
            isUnlocked: session.isUnlocked,
            unlockReason: session.unlockReason || null,
          },
        })
      )
    );

    return NextResponse.json({ sessions: savedSessions }, { status: 201 });
  } catch (error) {
    console.error(`POST MonthlyKnightsCdtpSessions/${params.className}/sessions Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create sessions', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}