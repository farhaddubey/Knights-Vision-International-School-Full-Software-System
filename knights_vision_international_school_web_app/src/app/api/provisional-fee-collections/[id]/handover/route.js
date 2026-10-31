import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import { assertCollectionOfficer, collectionScope, optionalNote } from "@/src/lib/finance/provisionalCollections";

export async function POST(request, { params }) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const collectionId = Number(params.id);
    if (!Number.isInteger(collectionId) || collectionId <= 0) {
      throw new PanelAuthorizationError(400, "A valid provisional collection id is required.");
    }
    const body = await request.json();
    const handoverNote = optionalNote(body?.handoverNote, "handoverNote");
    const result = await prisma.$transaction(async (tx) => {
      const beforeLock = await tx.provisionalFeeCollection.findUnique({
        where: { id: collectionId },
        select: { id: true, schoolId: true, branchId: true, classId: true, collectorUserId: true },
      });
      if (!beforeLock) return null;
      if (!hasScopeAccess(authorization, beforeLock) || beforeLock.collectorUserId !== authorization.user.id) {
        throw new PanelAuthorizationError(403, "Only the officer who recorded this collection can mark it handed over.");
      }
      await tx.$queryRaw`SELECT "id" FROM "ProvisionalFeeCollection" WHERE "id" = ${collectionId} FOR UPDATE`;
      const collection = await tx.provisionalFeeCollection.findUnique({ where: { id: collectionId } });
      if (!collection) return null;
      if (collection.status === "HANDED_OVER") return { collection, idempotent: true };
      if (collection.status !== "PENDING_HANDOVER" && collection.status !== "PENDING_VERIFICATION") {
        throw new PanelAuthorizationError(409, "Only a collected, unverified payment can be handed over.");
      }
      const updated = await tx.provisionalFeeCollection.update({
        where: { id: collection.id },
        data: {
          status: "HANDED_OVER",
          handedOverById: authorization.user.id,
          handedOverAt: new Date(),
          handoverNote,
        },
      });
      return { collection: updated, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Provisional collection not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: result.collection.paymentKind === "MONTHLY_TUITION"
          ? "monthly_fee.provisional_collection.handover"
          : "student_lifecycle.provisional_collection.handover",
        resource: "ProvisionalFeeCollection",
        resourceId: result.collection.publicId,
        scope: collectionScope(result.collection),
        afterData: { status: result.collection.status, handoverNote: result.collection.handoverNote },
      });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
      return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    }
    console.error("[Provisional fee handover]", error);
    return NextResponse.json({ error: "Unable to record the handover." }, { status: 500 });
  }
}
