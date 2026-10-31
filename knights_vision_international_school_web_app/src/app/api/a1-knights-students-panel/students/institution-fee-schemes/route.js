import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  requireStudentSession,
  StudentAuthorizationError,
} from "@/src/lib/student/sessionAuthorization";

// Support and concession schemes are internal finance decisions. Only these
// two published schemes are visible to an authenticated student/guardian.
const VISIBLE_CATEGORIES = ["KSAT_GENERAL", "DIRECT_GENERAL"];

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { student } = await requireStudentSession(request);
    if (!student.schoolId || !student.branchId) {
      return NextResponse.json({ error: "Your school placement is incomplete." }, { status: 409 });
    }

    const feeSchemes = await prisma.feeScheme.findMany({
      where: {
        category: { in: VISIBLE_CATEGORIES },
        class: { is: { schoolId: student.schoolId, branchId: student.branchId } },
      },
      select: {
        id: true,
        category: true,
        monthlyFee: true,
        admissionFee: true,
        readmissionFee: true,
        class: { select: { id: true, name: true, section: true } },
      },
      orderBy: [{ classId: "asc" }, { category: "asc" }],
    });

    return NextResponse.json({ feeSchemes });
  } catch (error) {
    if (error instanceof StudentAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("GET student institution fee schemes failed:", error);
    return NextResponse.json({ error: "Unable to fetch the institutional fee structure." }, { status: 500 });
  }
}
