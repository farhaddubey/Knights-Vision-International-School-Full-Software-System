import { getMonthlyAttendance } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getMonthlyAttendance(request, params.className);
}
