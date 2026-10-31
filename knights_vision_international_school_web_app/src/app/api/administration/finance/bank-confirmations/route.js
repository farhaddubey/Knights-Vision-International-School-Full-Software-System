import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, requireAdministrationPermission } from "@/src/lib/rbac/authorization";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { assertCentralBankConfirmationAuthority } from "@/src/lib/finance/centralBankConfirmation";

export const dynamic = "force-dynamic";

function dateRange(value) {
  if (!value) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new PanelAuthorizationError(400, "settlementDate must use YYYY-MM-DD.");
  }
  const start = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) throw new PanelAuthorizationError(400, "settlementDate is invalid.");
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { gte: start, lt: end };
}

function collectionKind(value) {
  const kind = String(value || "").trim().toUpperCase();
  if (kind === "MONTHLY") return { key: kind, paymentKind: "MONTHLY_TUITION" };
  if (kind === "ADMISSION") return { key: kind, paymentKind: { in: ["NEW_ADMISSION", "READMISSION"] } };
  throw new PanelAuthorizationError(400, "kind must be MONTHLY or ADMISSION.");
}

function nameOf(student) {
  return [student?.firstName, student?.middleName, student?.lastName].filter(Boolean).join(" ") || "Unnamed student";
}

export async function GET(request) {
  try {
    const authorization = await requireAdministrationPermission(request, "fee.receive");
    assertCentralBankConfirmationAuthority(authorization);

    const searchParams = new URL(request.url).searchParams;
    const kind = collectionKind(searchParams.get("kind"));
    const submittedOn = dateRange(searchParams.get("settlementDate"));
    const scope = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const collections = await prisma.provisionalFeeCollection.findMany({
      where: {
        ...scope,
        status: "BANK_SUBMITTED",
        paymentKind: kind.paymentKind,
        ...(submittedOn ? { bankSubmittedAt: submittedOn } : {}),
      },
      include: {
        monthlyFee: {
          select: {
            id: true, month: true, year: true, totalDue: true, paidAmount: true, academicYear: true,
            student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
          },
        },
        admission: {
          select: {
            id: true, admissionType: true, finalAdmissionNumber: true, admissionDate: true,
            student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
          },
        },
        collector: { select: { id: true, username: true, email: true } },
        handedOverBy: { select: { id: true, username: true, email: true } },
        verifier: { select: { id: true, username: true, email: true } },
        bankSubmittedBy: { select: { id: true, username: true, email: true } },
      },
      orderBy: [{ bankSubmittedAt: "asc" }, { id: "asc" }],
      take: 1000,
    });

    const classIds = [...new Set(collections.map((collection) => collection.classId))];
    const classRows = classIds.length ? await prisma.schoolClass.findMany({
      where: { id: { in: classIds } },
      select: {
        id: true, name: true, section: true, academicYear: true,
        branch: { select: { id: true, name: true, code: true, school: { select: { id: true, name: true } } } },
      },
    }) : [];
    const classById = new Map(classRows.map((schoolClass) => [schoolClass.id, schoolClass]));
    const totalAmount = collections.reduce((sum, collection) => sum + collection.amount, 0);

    return NextResponse.json({
      kind: kind.key,
      settlementDate: searchParams.get("settlementDate") || null,
      summary: {
        bankSubmittedCount: collections.length,
        bankSubmittedAmount: totalAmount,
        distinctBankReferences: new Set(collections.map((collection) => collection.bankTransactionId).filter(Boolean)).size,
      },
      collections: collections.map((collection) => ({
        ...collection,
        schoolClass: classById.get(collection.classId) || null,
        student: collection.monthlyFee?.student || collection.admission?.student || null,
        studentName: nameOf(collection.monthlyFee?.student || collection.admission?.student),
      })),
    });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Central bank confirmations]", error);
    return NextResponse.json({ error: "Unable to load bank-submitted collections." }, { status: 500 });
  }
}
