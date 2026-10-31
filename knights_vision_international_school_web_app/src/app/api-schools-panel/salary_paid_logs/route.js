import { postEmployeeSalaryPayment } from "@/src/lib/payroll/payrollMutations";

export async function POST(request) {
  return postEmployeeSalaryPayment(request, { response: "payment" });
}
