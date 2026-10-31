import {
  deleteEmployeeAttendanceLog,
  getEmployeeAttendanceLog,
  updateEmployeeAttendanceLog,
} from "@/src/lib/attendance/employeeWorkforce";

export async function GET(request, { params }) {
  const { id } = await params;
  return getEmployeeAttendanceLog(request, id);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return updateEmployeeAttendanceLog(request, id);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return deleteEmployeeAttendanceLog(request, id);
}
