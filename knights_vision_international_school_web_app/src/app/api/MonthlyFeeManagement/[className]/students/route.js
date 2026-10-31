import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const pageSize = parseInt(searchParams.get('pageSize') || '10', 10);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);

    // Validate className against ClassName enum
    const validClassNames = [
      'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
      'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
    ];
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    const students = await prisma.student.findMany({
      where: { 
        class: { name: className.toUpperCase() }, 
        academicYear 
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        class: { select: { name: true, section: true } },
        feeScheme: { select: { id: true, monthlyFee: true, category: true } },
      },
    });

    const total = await prisma.student.count({ 
      where: { 
        class: { name: className.toUpperCase() }, 
        academicYear 
      } 
    });
    const totalPages = Math.ceil(total / pageSize);

    return NextResponse.json({ students, totalPages }, { status: 200 });
  } catch (error) {
    console.error(`GET MonthlyFeeManagement/${params.className}/students Error:`, error.message);
    return NextResponse.json({ error: 'Failed to fetch students', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}