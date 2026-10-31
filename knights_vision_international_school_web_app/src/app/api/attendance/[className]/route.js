import { getAttendanceRegister } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getAttendanceRegister(request, params.className);
}
