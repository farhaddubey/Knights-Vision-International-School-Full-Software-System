import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";
import { resolveScopedCommunicationClass } from "@/src/lib/communications/scopedGuardianCommunication";

function pageNumber(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export async function GET(request, { params }) {
  try {
    const { className } = await params;
    // Listing students is safe for scoped fee viewers. The payment endpoint
    // separately requires fee.manage before it can mutate the ledger.
    const { schoolClass } = await resolveScopedCommunicationClass(request, className, "fee.read");
    const { searchParams } = new URL(request.url);
    const page = pageNumber(searchParams.get("page"), 1);
    const pageSize = Math.min(pageNumber(searchParams.get("pageSize"), 10), 100);
    const search = String(searchParams.get("searchQuery") || "").trim();
    const where = {
      schoolId: schoolClass.schoolId,
      branchId: schoolClass.branchId,
      classId: schoolClass.id,
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: "insensitive" } },
          { middleName: { contains: search, mode: "insensitive" } },
          { lastName: { contains: search, mode: "insensitive" } },
          { admissionNumber: { contains: search, mode: "insensitive" } },
        ],
      } : {}),
    };
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        select: {
          id: true,
          firstName: true,
          middleName: true,
          lastName: true,
          admissionNumber: true,
          finalAdmissionId: true,
          feeSchemeId: true,
          schoolId: true,
          branchId: true,
          classId: true,
          class: { select: { name: true, section: true } },
          feeScheme: { select: { id: true, monthlyFee: true, category: true } },
        },
      }),
      prisma.student.count({ where }),
    ]);
    return NextResponse.json({ students, totalPages: Math.max(1, Math.ceil(total / pageSize)), total });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Class monthly fee students]", error);
    return NextResponse.json({ error: "Unable to load class students for monthly fees." }, { status: 500 });
  }
}
