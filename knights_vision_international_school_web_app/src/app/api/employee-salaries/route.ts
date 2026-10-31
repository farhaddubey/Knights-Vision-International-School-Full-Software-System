import { getEmployeeSalaryMonth } from "@/src/lib/attendance/employeeWorkforce";
import { createEmployeeSalary } from "@/src/lib/payroll/payrollMutations";

export const GET = getEmployeeSalaryMonth;
export const POST = createEmployeeSalary;
