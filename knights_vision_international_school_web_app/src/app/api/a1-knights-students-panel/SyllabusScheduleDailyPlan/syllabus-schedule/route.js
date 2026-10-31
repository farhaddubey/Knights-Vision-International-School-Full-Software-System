import { NextResponse } from "next/server";
import {
  StudentAuthorizationError,
  requireStudentSession,
  studentAuthorizationErrorResponse,
} from "@/src/lib/student/sessionAuthorization";
import {
  DailySyllabusScopeError,
  getBranchDailySchedules,
} from "@/src/lib/syllabus/dailyBranchCompletion";

/**
 * A student may only read the daily plan and completion state for the class,
 * school, and branch on their live Student record. Browser-supplied IDs never
 * select another branch's delivery status.
 */
export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    const { searchParams } = new URL(request.url);
    const { schedules } = await getBranchDailySchedules(searchParams.get("classSubjectId"), student);
    return NextResponse.json({ schedules }, { status: 200 });
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

export const dynamic = "force-dynamic";
