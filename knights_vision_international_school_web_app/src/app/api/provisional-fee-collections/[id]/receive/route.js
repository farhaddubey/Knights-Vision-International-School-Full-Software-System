import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requireAdministrationPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import { collectionScope, feeOutstanding, isAdministrationReceiptConfirmationEnabled, optionalNote } from "@/src/lib/finance/provisionalCollections";
import {
  assertCentralBankConfirmationAuthority,
  bankCreditDate,
  requiredBankCreditReference,
} from "@/src/lib/finance/centralBankConfirmation";

export async function POST(request, { params }) {
  try {
    const authorization = await requireAdministrationPermission(request, "fee.receive");
    assertCentralBankConfirmationAuthority(authorization);
    if (!isAdministrationReceiptConfirmationEnabled()) {
      throw new PanelAuthorizationError(409, "Administration receipt confirmation is not active yet. Complete the school-level COEF bank-submission stage; Central Administration confirmation is Phase 2.");
    }
    const id = Number(params.id);
    if (!Number.isInteger(id) || id <= 0) throw new PanelAuthorizationError(400, "A valid collection id is required.");
    const body = await request.json();
    const receivedNote = optionalNote(body?.receivedNote, "receivedNote");
    const centralBankCreditReference = requiredBankCreditReference(body?.bankCreditReference);
    const centralBankCreditDate = bankCreditDate(body?.bankCreditDate);
    const result = await prisma.$transaction(async (tx) => {
      const collection = await tx.provisionalFeeCollection.findUnique({ where: { id } });
      if (!collection) return null;
      if (!hasScopeAccess(authorization, collection)) throw new PanelAuthorizationError(403, "You cannot confirm receipt outside your assigned scope.");
      if (collection.status === "RECEIVED") return { collection, idempotent: true };
      if (collection.status !== "BANK_SUBMITTED") throw new PanelAuthorizationError(409, "Administration can confirm only a COEF bank-submitted collection.");
      if (collection.admissionId && !collection.monthlyFeeId) {
        await tx.$queryRaw`SELECT "id" FROM "Admission" WHERE "id" = ${collection.admissionId} FOR UPDATE`;
        const admission = await tx.admission.findUnique({
          where: { id: collection.admissionId },
          include: { feeScheme: true },
        });
        if (!admission || !admission.feeScheme) throw new PanelAuthorizationError(409, "The linked admission no longer has a valid fee scheme.");
        const configuredFee = admission.admissionType === "READMISSION"
          ? admission.feeScheme.readmissionFee
          : admission.feeScheme.admissionFee;
        const recorded = await tx.admissionFeeTransaction.aggregate({
          where: { admissionId: admission.id },
          _sum: { amount: true },
        });
        const receivedAmount = recorded._sum.amount || 0;
        if (collection.amount > configuredFee - receivedAmount + 0.00001) {
          throw new PanelAuthorizationError(409, "The collection exceeds the remaining configured admission fee.");
        }
        const transaction = await tx.admissionFeeTransaction.create({
          data: {
            admissionId: admission.id,
            studentId: admission.studentId,
            schoolId: admission.schoolId,
            branchId: admission.branchId,
            classId: admission.classId,
            academicYear: new Date(admission.admissionDate).getFullYear(),
            amount: collection.amount,
            feeType: admission.admissionType === "READMISSION" ? "READMISSION" : admission.admissionType === "MIGRATION" ? "MIGRATION" : "FRESH",
            paymentDate: new Date(),
            paymentMethod: collection.method === "NET_BANKING" ? "BANK_TRANSFER" : collection.method,
            transactionId: collection.transactionId || collection.bankTransactionId,
            receivedBy: String(authorization.user.id),
            remarks: collection.submittedRemarks || "Lifecycle fee receipt confirmed",
          },
        });
        const totalReceived = receivedAmount + collection.amount;
        const admissionStatus = totalReceived + 0.00001 >= configuredFee ? "CONFIRMED" : "PENDING";
        await tx.admission.update({ where: { id: admission.id }, data: { status: admissionStatus } });
        if (admissionStatus === "CONFIRMED") {
          const enrollment = await tx.studentEnrollment.findUnique({ where: { admissionId: admission.id } });
          if (enrollment) {
            await tx.studentEnrollment.update({ where: { id: enrollment.id }, data: { status: "ACTIVE" } });
            await tx.student.update({
              where: { id: admission.studentId },
              data: {
                schoolId: admission.schoolId,
                branchId: admission.branchId,
                classId: admission.classId,
                academicYear: enrollment.academicYear,
                feeSchemeId: admission.feeSchemeId,
                finalAdmissionId: admission.id,
                status: "ACTIVE",
              },
            });
          }
        }
        const updated = await tx.provisionalFeeCollection.update({
          where: { id },
          data: {
            status: "RECEIVED",
            receivedById: authorization.user.id,
            receivedAt: new Date(),
            receivedNote,
            centralBankCreditReference,
            centralBankCreditDate,
            finalAdmissionFeeTransactionId: transaction.id,
          },
        });
        return { collection: updated, admissionFeeTransaction: transaction, idempotent: false };
      }
      await tx.$queryRaw`SELECT "id" FROM "MonthlyFee" WHERE "id" = ${collection.monthlyFeeId} FOR UPDATE`;
      const fee = await tx.monthlyFee.findUnique({ where: { id: collection.monthlyFeeId } });
      if (!fee || collection.amount > feeOutstanding(fee) + 0.00001) throw new PanelAuthorizationError(409, "The linked fee cannot be settled from this collection.");
      const paidAmount = fee.paidAmount + collection.amount;
      const totalDue = fee.totalDue + (fee.fineAmount || 0);
      const status = paidAmount + (fee.waivedAmount || 0) >= totalDue ? "PAID" : "PARTIALLY_PAID";
      await tx.monthlyFee.update({ where: { id: fee.id }, data: { paidAmount, status } });
      const payment = await tx.monthlyFeePayment.create({ data: { monthlyFeeId: fee.id, amount: collection.amount, method: collection.method, transactionId: collection.transactionId || collection.bankTransactionId, receivedBy: String(authorization.user.id), remarks: collection.submittedRemarks } });
      const updated = await tx.provisionalFeeCollection.update({ where: { id }, data: { status: "RECEIVED", receivedById: authorization.user.id, receivedAt: new Date(), receivedNote, centralBankCreditReference, centralBankCreditDate, finalPaymentId: payment.id } });
      return { collection: updated, payment, idempotent: false };
    });
    if (!result) return NextResponse.json({ error: "Collection not found." }, { status: 404 });
    if (!result.idempotent) await appendFinanceAuditEvent({ actorUserId: authorization.user.id, action: result.collection.paymentKind === "MONTHLY_TUITION" ? "monthly_fee.provisional_collection.received" : "student_lifecycle.provisional_collection.received", resource: "ProvisionalFeeCollection", resourceId: result.collection.publicId, scope: collectionScope(result.collection), afterData: { status: result.collection.status, centralBankCreditReference, centralBankCreditDate: centralBankCreditDate.toISOString(), finalPaymentId: result.payment?.id || result.collection.finalPaymentId, finalAdmissionFeeTransactionId: result.admissionFeeTransaction?.id || result.collection.finalAdmissionFeeTransactionId } });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Fee receipt confirmation]", error);
    return NextResponse.json({ error: "Unable to confirm the bank receipt." }, { status: 500 });
  }
}
