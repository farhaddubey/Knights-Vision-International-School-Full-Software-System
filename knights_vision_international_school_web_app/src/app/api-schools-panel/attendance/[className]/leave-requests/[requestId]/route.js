import { updateClassLeaveRequest } from "@/src/lib/attendance/scopedAttendance";

export async function POST(request, { params }) {
  return updateClassLeaveRequest(request, params.className, params.requestId);
}
