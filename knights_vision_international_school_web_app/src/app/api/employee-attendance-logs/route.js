import {
  createEmployeeAttendanceLog,
  getEmployeeAttendanceForDay,
} from "@/src/lib/attendance/employeeWorkforce";

export const GET = getEmployeeAttendanceForDay;
export const POST = createEmployeeAttendanceLog;
