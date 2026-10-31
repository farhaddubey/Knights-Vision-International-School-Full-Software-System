import { getEmployeeSalaryPage } from "@/src/lib/attendance/employeeWorkforce";
import { deleteEmployeeSalary, updateEmployeeSalary } from "@/src/lib/payroll/payrollMutations";

export async function GET(request, { params }) {
  const { id } = await params;
  return getEmployeeSalaryPage(request, id);
}

export async function PUT(request, { params }) {
  const { id } = await params;
  return updateEmployeeSalary(request, id);
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  return deleteEmployeeSalary(request, id);
}
