import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import { assertCoefVerifier, collectionScope, optionalNote } from "@/src/lib/finance/provisionalCollections";

export async function POST(request, { params }) {
  try {
    const authorization = await requirePanelPermission(request, "fee.verify");
    assertCoefVerifier(authorization);
    const collectionId = Number(params.id);
    if (!Number.isInteger(collectionId) || collectionId <= 0) {
      throw new PanelAuthorizationError(400, "A valid provisional collection id is required.");
    }
    const body = await request.json();
    const decision = typeof body?.decision === "string" ? body.decision.trim().toUpperCase() : "";
    if (decision !== "VERIFY" && decision !== "REJECT") {
      throw new PanelAuthorizationError(400, "decision must be VERIFY or REJECT.");
    }
    const verificationNote = optionalNote(body?.verificationNote, "verificationNote");
    if (!verificationNote) {
      throw new PanelAuthorizationError(400, "A written COEF verification note is required before approving or rejecting a collection.");
    }

    const result = await prisma.$transaction(async (tx) => {
      const beforeLock = await tx.provisionalFeeCollection.findUnique({
        where: { id: collectionId },
        select: { id: true, schoolId: true, branchId: true, classId: true },
      });
      if (!beforeLock) return null;
      if (!hasScopeAccess(authorization, beforeLock)) {
        throw new PanelAuthorizationError(403, "You cannot verify a collection outside your assigned scope.");
      }
      await tx.$queryRaw`SELECT "id" FROM "ProvisionalFeeCollection" WHERE "id" = ${collectionId} FOR UPDATE`;
      const collection = await tx.provisionalFeeCollection.findUnique({ where: { id: collectionId } });
      if (!collection) return null;
      if (collection.status !== "HANDED_OVER") {
        if (collection.status === "VERIFIED" || collection.status === "REJECTED") return { collection, idempotent: true };
        throw new PanelAuthorizationError(409, "COEF can verify this collection only after GCI records the handover.");
      }

      if (decision === "REJECT") {
        const updated = await tx.provisionalFeeCollection.update({
          where: { id: collection.id },
          data: { status: "REJECTED", verifiedById: authorization.user.id, verifiedAt: new Date(), verificationNote },
        });
        return { collection: updated, idempotent: false };
      }

      // COEF approval is deliberately not a ledger settlement. It proves the
      // school department received and checked the guardian collection; the
      // bank-submission and Administration received stages remain auditable.
      const approved = await tx.provisionalFeeCollection.update({
        where: { id: collection.id },
        data: { status: "COEF_APPROVED", verifiedById: authorization.user.id, verifiedAt: new Date(), verificationNote },
      });
      return { collection: approved, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Provisional collection not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: result.collection.paymentKind === "MONTHLY_TUITION"
          ? (result.collection.status === "REJECTED"
            ? "monthly_fee.provisional_collection.reject"
            : "monthly_fee.provisional_collection.coef_approved")
          : (result.collection.status === "REJECTED"
            ? "student_lifecycle.provisional_collection.reject"
            : "student_lifecycle.provisional_collection.coef_approved"),
        resource: "ProvisionalFeeCollection",
        resourceId: result.collection.publicId,
        scope: collectionScope(result.collection),
        afterData: {
          status: result.collection.status,
          finalPaymentId: result.payment?.id ?? null,
          verificationNote: result.collection.verificationNote,
        },
      });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    if (error?.code === "P2002") return NextResponse.json({ error: "This payment reference is already recorded." }, { status: 409 });
    console.error("[Provisional fee verification]", error);
    return NextResponse.json({ error: "Unable to decide the provisional collection." }, { status: 500 });
  }
}
