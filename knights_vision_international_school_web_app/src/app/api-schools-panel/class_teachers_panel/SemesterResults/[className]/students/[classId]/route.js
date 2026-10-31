import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireClassAccess } from "@/src/lib/rbac/classSubjectAccess";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

export async function GET(request, { params }) {
  try {
    const { classId } = await params;
    const { schoolClass } = await requireClassAccess(request, "student.read", classId);
    const students = await prisma.student.findMany({
      where: {
        classId: schoolClass.id,
        branchId: schoolClass.branchId,
        schoolId: schoolClass.schoolId,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        middleName: true,
        rollNumber: true,
        branchId: true,
        schoolId: true,
        classId: true,
      },
      orderBy: { firstName: "asc" },
    });

    return NextResponse.json({ students });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET semester result students failed:", error);
    return NextResponse.json({ error: "Unable to fetch students." }, { status: 500 });
  }
}
