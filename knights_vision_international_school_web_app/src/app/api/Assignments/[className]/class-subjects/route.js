import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const where = {
      class: {
        name: classInfo.name,
        branchId: 1,
      },
    };

    const [classSubjects, totalCount] = await Promise.all([
      prisma.classSubject.findMany({
        where,
        include: {
          subject: true,
          teacher:{
            select:{
              username: true, 
            }
          }
        },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.classSubject.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return NextResponse.json(
      {
        classSubjects,
        totalPages,
        currentPage: page,
        totalCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(`GET Assignments/${params.className}/class-subjects Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch class subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}