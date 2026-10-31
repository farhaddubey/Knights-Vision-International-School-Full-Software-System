import { getEmployeeSalaryPayments } from "@/src/lib/attendance/employeeWorkforce";

export async function GET(request) {
  return getEmployeeSalaryPayments(request, true);
}
