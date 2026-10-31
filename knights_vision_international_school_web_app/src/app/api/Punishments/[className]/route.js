import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const searchQuery = searchParams.get('searchQuery') || '';
    const classId = parseInt(searchParams.get('classId'), 10);

    if (!classId || classId !== classInfo.id) {
      return NextResponse.json({ error: 'Invalid or mismatched classId' }, { status: 400 });
    }

    const whereClause = {
      classId,
      OR: searchQuery
        ? [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { type: { contains: searchQuery, mode: 'insensitive' } },
          ]
        : undefined,
    };

    const [punishments, total] = await Promise.all([
      prisma.punishment.findMany({
        where: whereClause,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.punishment.count({ where: whereClause }),
    ]);

    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ punishments, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET Punishments/${params.className} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch punishments', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request, { params }) {
  try {
    const { className } = params;
    const data = await request.json();
    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (data.classId && data.classId !== classInfo.id) {
      return NextResponse.json({ error: 'Invalid or mismatched classId' }, { status: 400 });
    }

    const punishment = await prisma.punishment.create({
      data: {
        classId: data.classId || null,
        title: data.title,
        description: data.description,
        severity: parseInt(data.severity),
        type: data.type,
      },
    });

    return NextResponse.json(punishment, { status: 201 });
  } catch (error) {
    console.error(`POST Punishments/${params.className} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to create punishment', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request, { params }) {
  try {
    const { className } = params;
    const data = await request.json();
    const classInfo = classMap[className.toLowerCase()];
    if (!classInfo) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    if (data.classId && data.classId !== classInfo.id) {
      return NextResponse.json({ error: 'Invalid or mismatched classId' }, { status: 400 });
    }

    if (!data.id) {
      return NextResponse.json({ error: 'Missing punishment ID' }, { status: 400 });
    }

    const punishment = await prisma.punishment.update({
      where: { id: parseInt(data.id) },
      data: {
        classId: data.classId || null,
        title: data.title,
        description: data.description,
        severity: parseInt(data.severity),
        type: data.type,
      },
    });

    return NextResponse.json(punishment, { status: 200 });
  } catch (error) {
    console.error(`PUT Punishments/${params.className} Error:`, error.message);
    return NextResponse.json({ error: 'Failed to update punishment', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}