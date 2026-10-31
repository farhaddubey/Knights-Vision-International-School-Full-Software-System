import { NextRequest, NextResponse } from "next/server";
import prisma from '@/src/lib/prisma';

export async function GET() {
  try {
    const topics = await prisma.knowledgeTopic.findMany({
      where: {
        type: 'Tutorial',
      },
    })

    return NextResponse.json(topics)
  } catch (error) {
    console.error('Error fetching knowledge topics:', {
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      { error: 'Failed to fetch knowledge topics.', details: error.message },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
