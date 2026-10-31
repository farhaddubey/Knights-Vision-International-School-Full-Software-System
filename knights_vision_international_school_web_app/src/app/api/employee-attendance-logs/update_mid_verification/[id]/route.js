import { updateEmployeeMidVerification } from "@/src/lib/attendance/employeeWorkforce";

export async function PUT(request, { params }) {
  const { id } = await params;
  return updateEmployeeMidVerification(request, id);
}
