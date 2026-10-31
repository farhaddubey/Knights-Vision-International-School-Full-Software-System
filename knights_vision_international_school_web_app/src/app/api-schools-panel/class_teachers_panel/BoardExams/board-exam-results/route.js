import { NextResponse } from 'next/server';


export async function GET(request, { params }) {
  try {

    const className = params.className;
    const { boardExamId } = request.nextUrl.searchParams;

    const results = await prisma.boardExamResult.findMany({
      where: { boardExamId: parseInt(boardExamId) },
    });

    return NextResponse.json({ results });
  } catch (error) {
    console.error(`GET BoardExams/${params.className}/board-exam-results Error:`, error.message);
    return NextResponse.json(
      { error: 'Failed to fetch board exam results', detail: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}