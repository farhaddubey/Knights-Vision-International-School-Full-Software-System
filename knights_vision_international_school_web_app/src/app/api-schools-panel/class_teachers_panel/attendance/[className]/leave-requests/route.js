import { getClassLeaveRequests } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getClassLeaveRequests(request, params.className);
}
