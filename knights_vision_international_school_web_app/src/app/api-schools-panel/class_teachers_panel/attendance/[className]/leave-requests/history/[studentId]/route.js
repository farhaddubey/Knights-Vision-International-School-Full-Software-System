import { getStudentLeaveRequestHistory } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getStudentLeaveRequestHistory(request, params.className, params.studentId);
}
