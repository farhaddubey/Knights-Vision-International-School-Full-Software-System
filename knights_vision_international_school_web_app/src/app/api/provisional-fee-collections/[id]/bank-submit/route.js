import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import { assertCoefVerifier, collectionScope, optionalNote } from "@/src/lib/finance/provisionalCollections";

export async function POST(request, { params }) {
  try {
    const authorization = await requirePanelPermission(request, "fee.verify");
    assertCoefVerifier(authorization);
    const id = Number(params.id);
    const body = await request.json();
    const bankTransactionId = typeof body?.bankTransactionId === "string" ? body.bankTransactionId.trim() : "";
    if (!Number.isInteger(id) || id <= 0 || !bankTransactionId || bankTransactionId.length > 100) throw new PanelAuthorizationError(400, "A valid school bank transaction id is required.");
    const bankSubmissionNote = optionalNote(body?.bankSubmissionNote, "bankSubmissionNote");
    const result = await prisma.$transaction(async (tx) => {
      const beforeLock = await tx.provisionalFeeCollection.findUnique({
        where: { id },
        select: { id: true, schoolId: true, branchId: true, classId: true },
      });
      if (!beforeLock) return null;
      if (!hasScopeAccess(authorization, beforeLock)) throw new PanelAuthorizationError(403, "You cannot submit this collection to the bank.");
      await tx.$queryRaw`SELECT "id" FROM "ProvisionalFeeCollection" WHERE "id" = ${id} FOR UPDATE`;
      const existing = await tx.provisionalFeeCollection.findUnique({ where: { id } });
      if (!existing) return null;
      if (existing.status === "BANK_SUBMITTED") return { collection: existing, idempotent: true };
      if (existing.status !== "COEF_APPROVED") throw new PanelAuthorizationError(409, "Only a COEF-approved collection can be submitted to the school bank.");
      const collection = await tx.provisionalFeeCollection.update({ where: { id }, data: { status: "BANK_SUBMITTED", bankSubmittedById: authorization.user.id, bankSubmittedAt: new Date(), bankTransactionId, bankSubmissionNote } });
      return { collection, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({ actorUserId: authorization.user.id, action: result.collection.paymentKind === "MONTHLY_TUITION" ? "monthly_fee.provisional_collection.bank_submitted" : "student_lifecycle.provisional_collection.bank_submitted", resource: "ProvisionalFeeCollection", resourceId: result.collection.publicId, scope: collectionScope(result.collection), afterData: { status: result.collection.status, bankTransactionId } });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Fee bank submission]", error);
    return NextResponse.json({ error: "Unable to submit this collection to the school bank." }, { status: 500 });
  }
}
