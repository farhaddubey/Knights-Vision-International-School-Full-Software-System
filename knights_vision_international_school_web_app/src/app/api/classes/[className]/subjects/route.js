import {  NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

// Define ClassName enum values (matching the Prisma schema)
const validClassNames = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 
  'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XS', 'XI', 'XII', 'XIIS', 'XIII', 'XIIIJ'
];

export async function GET(request, { params }) {
  try {
    const { className } = params;
    const { searchParams } = new URL(request.url);
    const academicYear = parseInt(searchParams.get('academicYear'), 10);
    const branchId = parseInt(searchParams.get('branchId') || '1', 10);

    // Validate className against ClassName enum
    if (!validClassNames.includes(className.toUpperCase())) {
      return NextResponse.json({ error: 'Invalid class name' }, { status: 400 });
    }

    // Validate academicYear
    if (!academicYear || isNaN(academicYear)) {
      return NextResponse.json({ error: 'Invalid academic year' }, { status: 400 });
    }

    const subjects = await prisma.classSubject.findMany({
      where: {
        class: {
          name: className.toUpperCase(),
          branchId,
          academicYear,
        },
      },
      include: { subject: { select: { name: true } } },
    });

    return NextResponse.json({ subjects }, { status: 200 });
  } catch (error) {
    console.error(`GET /api/classes/${params.className}/subjects Error:`, error);
    return NextResponse.json({ error: 'Failed to fetch subjects', detail: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}