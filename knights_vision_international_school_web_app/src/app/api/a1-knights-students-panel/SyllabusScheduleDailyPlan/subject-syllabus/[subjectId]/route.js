import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import {
  StudentAuthorizationError,
  requireStudentSession,
  studentAuthorizationErrorResponse,
} from '@/src/lib/student/sessionAuthorization';
import {
  DailySyllabusScopeError,
  getClassSubjectInBranch,
} from '@/src/lib/syllabus/dailyBranchCompletion';

export async function GET(request, { params }) {
  try {
    const { subjectId } = params;
    if (!subjectId || isNaN(parseInt(subjectId))) {
      return NextResponse.json({ error: 'Missing or invalid class subject ID' }, { status: 400 });
    }

    const { student } = await requireStudentSession(request);
    // Keep the legacy URL stable, but resolve it through the student's live
    // class/school/branch rather than allowing a global subject lookup.
    const classSubject = await getClassSubjectInBranch(subjectId, student);

    const topics = await prisma.subjectSyllabus.findMany({
      where: { subjectId: classSubject.id },
      orderBy: { topic: 'asc' },
    });

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error) {
    if (error instanceof DailySyllabusScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    if (error instanceof StudentAuthorizationError) {
      return studentAuthorizationErrorResponse(error);
    }
    return studentAuthorizationErrorResponse(error);
  }
}
