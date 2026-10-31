import { NextResponse } from "next/server";
import {
  authorizationErrorResponse,
  hasPermission,
  hasScopeAccess,
  requireFacultyPermission,
} from "@/src/lib/rbac/authorization";
import {
  DailySyllabusScopeError,
  completeBranchDailySchedule,
  getDailyScheduleScope,
} from "@/src/lib/syllabus/dailyBranchCompletion";

function classSubjectTarget(classSubject) {
  return {
    schoolId: classSubject.schoolId,
    branchId: classSubject.branchId,
    classId: classSubject.classId,
  };
}

function ensureFacultyCanComplete(authorization, classSubject) {
  const target = classSubjectTarget(classSubject);
  if (!hasScopeAccess(authorization, target)) {
    throw new DailySyllabusScopeError(403, "You do not have access to this school, branch, or class syllabus.");
  }

  const canManageSyllabus = ["homework.manage", "class.manage", "exam.manage"].some((permission) =>
    hasPermission(authorization, permission),
  );
  if (!canManageSyllabus) {
    throw new DailySyllabusScopeError(403, "You are not permitted to mark daily syllabus delivery complete.");
  }

  if (hasPermission(authorization, "class.manage")) return;
  const teachesSubject = classSubject.teacherId === authorization.user.id;
  const leadsClass = classSubject.class?.classTeacherId === authorization.user.id;
  if (!teachesSubject && !leadsClass) {
    throw new DailySyllabusScopeError(403, "You can only complete syllabus work assigned to you or your class.");
  }
}

export async function POST(request, { params }) {
  try {
    const authorization = await requireFacultyPermission(request, "class.read");
    const { id } = await params;
    const { classSubject } = await getDailyScheduleScope(id);
    ensureFacultyCanComplete(authorization, classSubject);

    const result = await completeBranchDailySchedule(id, classSubjectTarget(classSubject), authorization.user.id);
    if (result.alreadyCompleted) {
      return NextResponse.json({
        error: "This daily syllabus is already marked completed for your school branch.",
        data: result.completion,
      }, { status: 409 });
    }

    return NextResponse.json({
      message: "Daily syllabus marked completed for this school branch.",
      data: result.completion,
    }, { status: 200 });
  } catch (error) {
    if (error instanceof DailySyllabusScopeError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return authorizationErrorResponse(error);
  }
}
