import { getEmployeeSalaryPage } from "@/src/lib/attendance/employeeWorkforce";

export async function GET(request, { params }) {
  const { userId } = await params;
  return getEmployeeSalaryPage(request, userId);
}
