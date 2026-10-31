import { NextResponse } from "next/server";
import {
  authorizationErrorResponse,
  hasPermission,
  hasScopeAccess,
  requireFacultyPermission,
} from "@/src/lib/rbac/authorization";
import {
  DailySyllabusScopeError,
  getBranchDailySchedules,
  getClassSubjectScope,
} from "@/src/lib/syllabus/dailyBranchCompletion";

function classSubjectTarget(classSubject) {
  return {
    schoolId: classSubject.schoolId,
    branchId: classSubject.branchId,
    classId: classSubject.classId,
  };
}

function ensureAssignedFaculty(authorization, classSubject) {
  if (!hasScopeAccess(authorization, classSubjectTarget(classSubject))) {
    throw new DailySyllabusScopeError(403, "You do not have access to this school, branch, or class syllabus.");
  }
  if (hasPermission(authorization, "class.manage")) return;

  const teachesSubject = classSubject.teacherId === authorization.user.id;
  const leadsClass = classSubject.class?.classTeacherId === authorization.user.id;
  if (!teachesSubject && !leadsClass) {
    throw new DailySyllabusScopeError(403, "You can only view syllabus work assigned to you or your class.");
  }
}

export async function GET(request) {
  try {
    const authorization = await requireFacultyPermission(request, "class.read");
    const { searchParams } = new URL(request.url);
    const classSubjectId = searchParams.get("classSubjectId");
    const classSubject = await getClassSubjectScope(classSubjectId);
    ensureAssignedFaculty(authorization, classSubject);

    const { schedules } = await getBranchDailySchedules(classSubject.id, classSubjectTarget(classSubject));
    return NextResponse.json({ schedules }, { status: 200 });
  } catch (error) {
    if (error instanceof DailySyllabusScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return authorizationErrorResponse(error);
  }
}

// Daily-plan creation remains owned by the existing central curriculum tools.
// Faculty screens consume the plan and write only their branch completion row.
