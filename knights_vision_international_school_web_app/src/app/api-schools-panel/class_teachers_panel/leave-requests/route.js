import { getCurrentClassTeacherLeaveRequests } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request) {
  return getCurrentClassTeacherLeaveRequests(request);
}
