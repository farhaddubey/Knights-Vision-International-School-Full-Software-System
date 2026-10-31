import { getStudentAttendance, writeStudentAttendance } from "@/src/lib/attendance/scopedAttendance";

export async function GET(request, { params }) {
  return getStudentAttendance(request, params.className, params.studentId);
}

export async function POST(request, { params }) {
  return writeStudentAttendance(request, params.className, params.studentId);
}
