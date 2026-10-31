import { getStudentAttendanceHistory } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getStudentAttendanceHistory(request, params.className, params.studentId);
}
