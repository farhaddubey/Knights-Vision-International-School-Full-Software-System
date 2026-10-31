import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';



export async function GET(req: Request) {
  try {
    const problems = await prisma.country.findMany({
      select:{
          id: true, 
          name: true, 
          slug: true  
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(problems);
  } catch (error) {
    console.error('Error fetching legal problems:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
