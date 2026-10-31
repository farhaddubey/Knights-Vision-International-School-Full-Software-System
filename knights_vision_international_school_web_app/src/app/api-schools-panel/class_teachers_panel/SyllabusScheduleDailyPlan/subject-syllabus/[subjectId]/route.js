import { NextResponse } from 'next/server';
import prisma from '@/src/lib/prisma';
import {
  authorizationErrorResponse,
  hasPermission,
  hasScopeAccess,
  requireFacultyPermission,
} from '@/src/lib/rbac/authorization';
import {
  DailySyllabusScopeError,
  getClassSubjectScope,
} from '@/src/lib/syllabus/dailyBranchCompletion';

function classSubjectTarget(classSubject) {
  return {
    schoolId: classSubject.schoolId,
    branchId: classSubject.branchId,
    classId: classSubject.classId,
  };
}

function ensureAssignedFaculty(authorization, classSubject) {
  if (!hasScopeAccess(authorization, classSubjectTarget(classSubject))) {
    throw new DailySyllabusScopeError(403, 'You do not have access to this school, branch, or class syllabus.');
  }
  if (hasPermission(authorization, 'class.manage')) return;

  const teachesSubject = classSubject.teacherId === authorization.user.id;
  const leadsClass = classSubject.class?.classTeacherId === authorization.user.id;
  if (!teachesSubject && !leadsClass) {
    throw new DailySyllabusScopeError(403, 'You can only view syllabus work assigned to you or your class.');
  }
}

export async function GET(request, { params }) {
  try {
    const { subjectId } = params;
    if (!subjectId || isNaN(parseInt(subjectId))) {
      return NextResponse.json({ error: 'Missing or invalid class subject ID' }, { status: 400 });
    }

    const authorization = await requireFacultyPermission(request, 'class.read');
    // The legacy route parameter is called subjectId, but SubjectSyllabus is
    // linked to ClassSubject. Treat the value as a branch-owned class subject.
    const classSubject = await getClassSubjectScope(subjectId);
    ensureAssignedFaculty(authorization, classSubject);

    const topics = await prisma.subjectSyllabus.findMany({
      where: { subjectId: classSubject.id },
      orderBy: { topic: 'asc' },
    });

    return NextResponse.json({ topics }, { status: 200 });
  } catch (error) {
    if (error instanceof DailySyllabusScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return authorizationErrorResponse(error);
  }
}
