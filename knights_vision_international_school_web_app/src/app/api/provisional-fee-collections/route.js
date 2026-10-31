import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { buildScopedWhere } from "@/src/lib/rbac/policy";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import {
  assertCollectionOfficer,
  collectionScope,
  feeOutstanding,
  optionalNote,
  paymentMethod,
  positiveAmount,
  requiredIdempotencyKey,
  roleCodes,
  isCollectionOfficer,
  isAdministrationReceiptConfirmationEnabled,
  transactionReference,
  UNSETTLED_PROVISIONAL_COLLECTION_STATUSES,
} from "@/src/lib/finance/provisionalCollections";

function errorResponse(error, fallback) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 401 });
  }
  if (error?.code === "P2002") {
    return NextResponse.json({ error: "This collection was already submitted." }, { status: 409 });
  }
  console.error("[Provisional fee collection]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

function monthlyFilter(searchParams) {
  const now = new Date();
  const requestedMonth = Number(searchParams.get("month"));
  const requestedYear = Number(searchParams.get("year"));
  const month = Number.isInteger(requestedMonth) && requestedMonth >= 1 && requestedMonth <= 12
    ? requestedMonth
    : now.getMonth() + 1;
  const year = Number.isInteger(requestedYear) && requestedYear >= 2020 && requestedYear <= now.getFullYear() + 5
    ? requestedYear
    : now.getFullYear();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { month, year, collectedAt: { gte: start, lt: end } };
}

function paymentKindFilter(searchParams) {
  const allowed = new Set(["MONTHLY_TUITION", "NEW_ADMISSION", "READMISSION"]);
  const requested = String(searchParams.get("paymentKinds") || "")
    .split(",")
    .map((value) => value.trim().toUpperCase())
    .filter(Boolean);
  if (requested.some((value) => !allowed.has(value))) {
    throw new PanelAuthorizationError(400, "paymentKinds contains an unsupported collection type.");
  }
  return [...new Set(requested)];
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.read");
    const scopedWhere = buildScopedWhere(authorization.scopes, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
    const roles = roleCodes(authorization);
    const searchParams = new URL(request.url).searchParams;
    const filter = monthlyFilter(searchParams);
    const paymentKinds = paymentKindFilter(searchParams);
    const where = {
      ...scopedWhere,
      ...(isCollectionOfficer(authorization) && !roles.has("COEF") ? { collectorUserId: authorization.user.id } : {}),
      collectedAt: filter.collectedAt,
      ...(paymentKinds.length ? { paymentKind: { in: paymentKinds } } : {}),
    };
    const collections = await prisma.provisionalFeeCollection.findMany({
      where,
      include: {
        monthlyFee: {
          select: {
            id: true,
            month: true,
            year: true,
            totalDue: true,
            paidAmount: true,
            waivedAmount: true,
            fineAmount: true,
            student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
          },
        },
        admission: {
          select: {
            id: true,
            admissionType: true,
            finalAdmissionNumber: true,
            student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
          },
        },
        collector: { select: { id: true, username: true, email: true } },
        handedOverBy: { select: { id: true, username: true, email: true } },
        verifier: { select: { id: true, username: true, email: true } },
        bankSubmittedBy: { select: { id: true, username: true, email: true } },
        receivedBy: { select: { id: true, username: true, email: true } },
        finalPayment: { select: { id: true, paymentDate: true } },
        finalAdmissionFeeTransaction: { select: { id: true, paymentDate: true } },
      },
      orderBy: { collectedAt: "desc" },
      // This is the consolidated month register, not a day/week preview.
      // Keep enough rows for the seeded training branch and normal month-end work.
      take: 1000,
    });
    return NextResponse.json({
      collections,
      filters: { month: filter.month, year: filter.year, paymentKinds },
      phase: {
        schoolLevelFlow: true,
        administrationReceiptConfirmationEnabled: isAdministrationReceiptConfirmationEnabled(),
      },
      capabilities: {
        actorUserId: authorization.user.id,
        canSubmit: isCollectionOfficer(authorization),
        canHandover: isCollectionOfficer(authorization),
        canVerify: roles.has("COEF") && authorization.permissions.includes("fee.verify"),
        canReceive: isAdministrationReceiptConfirmationEnabled() && authorization.permissions.includes("fee.receive"),
      },
    });
  } catch (error) {
    return errorResponse(error, "Unable to load provisional collections.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const body = await request.json();
    const monthlyFeeId = Number(body?.monthlyFeeId);
    if (!Number.isInteger(monthlyFeeId) || monthlyFeeId <= 0) {
      throw new PanelAuthorizationError(400, "monthlyFeeId is required.");
    }
    const amount = positiveAmount(body?.amount);
    const method = paymentMethod(body?.method);
    const transactionId = transactionReference(body?.transactionId, method);
    const idempotencyKey = requiredIdempotencyKey(body?.idempotencyKey);
    const submittedRemarks = optionalNote(body?.remarks, "remarks");

    const result = await prisma.$transaction(async (tx) => {
      const earlier = await tx.provisionalFeeCollection.findUnique({ where: { idempotencyKey } });
      if (earlier) return { collection: earlier, idempotent: true };
      const feeBeforeLock = await tx.monthlyFee.findUnique({
        where: { id: monthlyFeeId },
        select: { id: true, schoolId: true, branchId: true, classId: true },
      });
      if (!feeBeforeLock) return null;
      if (!hasScopeAccess(authorization, feeBeforeLock)) {
        throw new PanelAuthorizationError(403, "You cannot collect a fee outside your assigned scope.");
      }
      await tx.$queryRaw`SELECT "id" FROM "MonthlyFee" WHERE "id" = ${monthlyFeeId} FOR UPDATE`;
      const fee = await tx.monthlyFee.findUnique({
        where: { id: monthlyFeeId },
        select: { id: true, schoolId: true, branchId: true, classId: true, totalDue: true, paidAmount: true, waivedAmount: true, fineAmount: true, status: true },
      });
      if (!fee) return null;
      if (fee.status === "PAID" || fee.status === "WAIVED") {
        throw new PanelAuthorizationError(409, "This fee is already settled.");
      }
      const pending = await tx.provisionalFeeCollection.aggregate({
        where: { monthlyFeeId, status: { in: UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } },
        _sum: { amount: true },
      });
      const available = feeOutstanding(fee) - (pending._sum.amount || 0);
      if (amount > available + 0.00001) {
        throw new PanelAuthorizationError(409, "amount exceeds the balance that is not already awaiting COEF verification.");
      }
      const collection = await tx.provisionalFeeCollection.create({
        data: {
          monthlyFeeId,
          schoolId: fee.schoolId,
          branchId: fee.branchId,
          classId: fee.classId,
          amount,
          method,
          transactionId,
          idempotencyKey,
          submittedRemarks,
          collectorUserId: authorization.user.id,
        },
      });
      return { collection, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Monthly fee not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: "monthly_fee.provisional_collection.submit",
        resource: "ProvisionalFeeCollection",
        resourceId: result.collection.publicId,
        scope: collectionScope(result.collection),
        afterData: { monthlyFeeId, amount, method, transactionId, status: result.collection.status },
      });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    return errorResponse(error, "Unable to submit provisional collection.");
  }
}
