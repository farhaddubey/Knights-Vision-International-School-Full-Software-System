import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { requirePanelPermission } from "@/src/lib/rbac/authorization";
import { CLASS_NAMES, lifecycleErrorResponse } from "@/src/lib/student-lifecycle/management";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "student.read");
    const requestedClass = String(new URL(request.url).searchParams.get("className") || "").trim().toUpperCase();
    if (requestedClass && !CLASS_NAMES.has(requestedClass)) return NextResponse.json({ error: "Invalid class name." }, { status: 400 });
    const scope = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "id" });
    const classes = await prisma.schoolClass.findMany({
      where: { AND: [scope, ...(requestedClass ? [{ name: requestedClass }] : [])] },
      orderBy: [{ academicYear: "desc" }, { name: "asc" }, { section: "asc" }],
      select: {
        id: true,
        name: true,
        section: true,
        schoolId: true,
        branchId: true,
        academicYear: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
            school: { select: { id: true, name: true } },
          },
        },
        FeeScheme: { select: { id: true, category: true, admissionFee: true, readmissionFee: true, monthlyFee: true } },
      },
    });
    return NextResponse.json({ classes });
  } catch (error) {
    return lifecycleErrorResponse(error, "Unable to load lifecycle catalog data.");
  }
}
