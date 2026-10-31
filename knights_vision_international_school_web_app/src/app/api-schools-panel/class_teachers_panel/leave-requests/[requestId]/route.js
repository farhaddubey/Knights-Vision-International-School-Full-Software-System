import { updateCurrentClassTeacherLeaveRequest } from "@/src/lib/attendance/scopedAttendance";

export async function PATCH(request, { params }) {
  return updateCurrentClassTeacherLeaveRequest(request, params.requestId);
}
