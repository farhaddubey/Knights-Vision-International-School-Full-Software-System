import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";

const METHODS = new Set(["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"]);

function positiveAmount(value) {
  const amount = typeof value === "string" ? Number(value) : value;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) throw new Error("INVALID_AMOUNT");
  return amount;
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.manage");
    const data = await request.json();
    const monthlyFeeId = Number(data?.monthlyFeeId);
    if (!Number.isInteger(monthlyFeeId) || monthlyFeeId <= 0) return NextResponse.json({ error: "monthlyFeeId is required." }, { status: 400 });
    const amount = positiveAmount(data?.amount);
    const method = typeof data?.method === "string" ? data.method.trim().toUpperCase() : "";
    if (!METHODS.has(method)) return NextResponse.json({ error: "A valid payment method is required." }, { status: 400 });
    const transactionId = typeof data?.transactionId === "string" && data.transactionId.trim() ? data.transactionId.trim() : null;
    if (method !== "CASH" && !transactionId) return NextResponse.json({ error: "transactionId is required for non-cash payments." }, { status: 400 });
    if (transactionId && transactionId.length > 100) return NextResponse.json({ error: "transactionId is too long." }, { status: 400 });
    const remarks = typeof data?.remarks === "string" ? data.remarks.trim().slice(0, 300) || null : null;

    const result = await prisma.$transaction(async (tx) => {
      const initialFee = await tx.monthlyFee.findUnique({
        where: { id: monthlyFeeId },
        select: { id: true, studentId: true, schoolId: true, branchId: true, classId: true, totalDue: true, paidAmount: true, waivedAmount: true, fineAmount: true },
      });
      if (!initialFee) return null;
      if (!hasScopeAccess(authorization, initialFee)) throw new PanelAuthorizationError(403, "You cannot record a fee outside your assigned scope.");
      await tx.$queryRaw`SELECT "id" FROM "MonthlyFee" WHERE "id" = ${initialFee.id} FOR UPDATE`;
      const fee = await tx.monthlyFee.findUnique({
        where: { id: initialFee.id },
        select: { id: true, studentId: true, schoolId: true, branchId: true, classId: true, totalDue: true, paidAmount: true, waivedAmount: true, fineAmount: true },
      });
      if (!fee) return null;
      if (transactionId) {
        const existing = await tx.monthlyFeePayment.findFirst({ where: { monthlyFeeId, transactionId } });
        if (existing) return { payment: existing, idempotent: true, fee };
      }
      const outstanding = Math.max(0, (fee.totalDue + (fee.fineAmount || 0)) - fee.paidAmount - (fee.waivedAmount || 0));
      if (amount > outstanding + 0.00001) throw new Error("AMOUNT_EXCEEDS_DUE");
      const nextPaidAmount = fee.paidAmount + amount;
      const nextStatus = nextPaidAmount + (fee.waivedAmount || 0) >= fee.totalDue + (fee.fineAmount || 0) ? "PAID" : "PARTIALLY_PAID";
      await tx.monthlyFee.update({ where: { id: fee.id }, data: { paidAmount: nextPaidAmount, status: nextStatus, remarks } });
      const payment = await tx.monthlyFeePayment.create({
        data: { monthlyFeeId, amount, method, transactionId, receivedBy: String(authorization.user.id), remarks },
      });
      return { payment, idempotent: false, fee };
    });
    if (!result) return NextResponse.json({ error: "Monthly fee not found." }, { status: 404 });
    if (!result.idempotent) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: "monthly_fee.payment.record",
        resource: "MonthlyFeePayment",
        resourceId: String(result.payment.id),
        scope: { scopeType: "CLASS", schoolId: result.fee.schoolId, branchId: result.fee.branchId, classId: result.fee.classId },
        afterData: { monthlyFeeId, amount, method, transactionId },
      });
    }
    return NextResponse.json(result, { status: result.idempotent ? 200 : 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    if (error?.message === "INVALID_AMOUNT") return NextResponse.json({ error: "amount must be a positive number." }, { status: 400 });
    if (error?.message === "AMOUNT_EXCEEDS_DUE") return NextResponse.json({ error: "amount exceeds the outstanding balance." }, { status: 409 });
    if (error && typeof error === "object" && error.code === "P2002") return NextResponse.json({ error: "This payment reference was already recorded." }, { status: 409 });
    console.error("[Monthly fee payment]", error);
    return NextResponse.json({ error: "Failed to record monthly fee payment." }, { status: 500 });
  }
}
