import { NextResponse } from "next/server";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import {
  lifecycleErrorResponse,
  studentByIdWithScope,
  updateStudentProfile,
} from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { id } = await context.params;
    const student = await studentByIdWithScope(id, authorization);
    return NextResponse.json(student);
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to fetch the student record.");
  }
}

// The old rich dialog remains usable for profile corrections, but it cannot
// change admission identity, class scope, or any login/activation secret.
export async function PUT(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "student.manage");
    const { id } = await context.params;
    const result = await updateStudentProfile(id, authorization, await request.json());
    return NextResponse.json({ student: result.updated });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to update the student record.");
  }
}

// Student records are historical financial and academic evidence.  Use the
// lifecycle Actions menu to mark a student left or request a TC instead.
export async function DELETE() {
  return NextResponse.json({ error: "Student deletion is disabled. Use Mark as Left or Transfer Certificate from Student Lifecycle." }, { status: 405 });
}
