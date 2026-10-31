import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

export async function GET(request, { params }) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const { classId: rawClassId } = await params;
    const classId = Number(rawClassId);
    if (!Number.isInteger(classId) || classId <= 0) {
      return NextResponse.json({ error: "A valid class ID is required." }, { status: 400 });
    }

    const schoolClass = await prisma.schoolClass.findUnique({
      where: { id: classId },
      select: { id: true, schoolId: true, branchId: true, academicYear: true },
    });
    if (!schoolClass) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }
    const classScope = { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
    if (!hasScopeAccess(authorization, classScope)) {
      return NextResponse.json({ error: "You do not have access to this class." }, { status: 403 });
    }

    const students = await prisma.student.findMany({
      where: {
        classId: schoolClass.id,
        schoolId: schoolClass.schoolId,
        branchId: schoolClass.branchId,
        academicYear: schoolClass.academicYear,
        status: "ACTIVE",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        rollNumber: true,
        schoolId: true,
        branchId: true,
      },
      orderBy: { rollNumber: "asc" },
    });

    return NextResponse.json({ students }, { status: 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET class students failed:", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
