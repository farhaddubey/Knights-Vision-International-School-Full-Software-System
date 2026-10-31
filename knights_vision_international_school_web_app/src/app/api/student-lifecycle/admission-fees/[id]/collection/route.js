import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import {
  assertCollectionOfficer,
  collectionScope,
  optionalNote,
  paymentMethod,
  positiveAmount,
  requiredIdempotencyKey,
  transactionReference,
  UNSETTLED_PROVISIONAL_COLLECTION_STATUSES,
} from "@/src/lib/finance/provisionalCollections";

function configuredAdmissionFee(admission) {
  return admission.admissionType === "READMISSION"
    ? admission.feeScheme?.readmissionFee ?? 0
    : admission.feeScheme?.admissionFee ?? 0;
}

export async function POST(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const { id } = await context.params;
    const admissionId = Number(id);
    if (!Number.isInteger(admissionId) || admissionId <= 0) throw new PanelAuthorizationError(400, "A valid admission id is required.");
    const body = await request.json();
    const amount = positiveAmount(body?.amount);
    const method = paymentMethod(body?.method);
    const transactionId = transactionReference(body?.transactionId, method);
    const idempotencyKey = requiredIdempotencyKey(body?.idempotencyKey);
    const submittedRemarks = optionalNote(body?.remarks, "remarks");
    const result = await prisma.$transaction(async (tx) => {
      const earlier = await tx.provisionalFeeCollection.findUnique({ where: { idempotencyKey } });
      if (earlier) return { collection: earlier, idempotent: true };
      const beforeLock = await tx.admission.findUnique({ where: { id: admissionId }, select: { id: true, schoolId: true, branchId: true, classId: true } });
      if (!beforeLock) return null;
      if (!hasScopeAccess(authorization, beforeLock)) throw new PanelAuthorizationError(403, "You cannot collect an admission fee outside your assigned scope.");
      await tx.$queryRaw`SELECT "id" FROM "Admission" WHERE "id" = ${admissionId} FOR UPDATE`;
      const admission = await tx.admission.findUnique({
        where: { id: admissionId },
        include: {
          feeScheme: { select: { admissionFee: true, readmissionFee: true } },
          AdmissionFeeTransaction: { select: { amount: true } },
        },
      });
      if (!admission || !admission.feeScheme || !["PENDING", "SELECTED"].includes(admission.status)) {
        throw new PanelAuthorizationError(409, "This admission is not open for a new fee collection.");
      }
      const configuredFee = configuredAdmissionFee(admission);
      const paidAmount = admission.AdmissionFeeTransaction.reduce((sum, transaction) => sum + transaction.amount, 0);
      const pending = await tx.provisionalFeeCollection.aggregate({
        where: { admissionId, status: { in: UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } },
        _sum: { amount: true },
      });
      const available = Math.max(0, configuredFee - paidAmount - (pending._sum.amount || 0));
      if (amount > available + 0.00001) throw new PanelAuthorizationError(409, "Amount exceeds the admission fee balance not already awaiting COEF verification.");
      const collection = await tx.provisionalFeeCollection.create({
        data: {
          paymentKind: admission.admissionType === "READMISSION" ? "READMISSION" : "NEW_ADMISSION",
          admissionId,
          schoolId: admission.schoolId,
          branchId: admission.branchId,
          classId: admission.classId,
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
    if (!result) return NextResponse.json({ error: "Admission not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: "admission_fee.provisional_collection.submit",
        resource: "ProvisionalFeeCollection",
        resourceId: result.collection.publicId,
        scope: collectionScope(result.collection),
        afterData: { admissionId, amount, method, transactionId, status: result.collection.status },
      });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Admission fee collection]", error);
    return NextResponse.json({ error: "Unable to record the admission fee collection." }, { status: 500 });
  }
}
