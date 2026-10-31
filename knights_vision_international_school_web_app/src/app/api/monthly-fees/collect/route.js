import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { PanelAuthorizationError, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";
import { assertCollectionOfficer, collectionScope, feeOutstanding, paymentMethod, transactionReference, UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } from "@/src/lib/finance/provisionalCollections";

function positiveInteger(value, label) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new PanelAuthorizationError(400, `${label} must be a positive whole number.`);
  return parsed;
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "fee.collect.provisional");
    assertCollectionOfficer(authorization);
    const body = await request.json();
    const studentId = positiveInteger(body?.studentId, "studentId");
    const academicYear = positiveInteger(body?.academicYear, "academicYear");
    const months = Array.isArray(body?.months) ? body.months.map((month) => positiveInteger(month, "month")) : [];
    if (!months.length || months.length > 12 || months.some((month) => month > 12) || new Set(months).size !== months.length) {
      throw new PanelAuthorizationError(400, "Select unique calendar months from 1 to 12.");
    }
    const method = paymentMethod(body?.paymentMethod);
    const transactionId = transactionReference(body?.transactionId, method);
    const remarks = typeof body?.remarks === "string" ? body.remarks.trim().slice(0, 300) || null : null;
    const student = await prisma.student.findUnique({ where: { id: studentId }, select: { id: true, schoolId: true, branchId: true, classId: true, finalAdmissionId: true, feeSchemeId: true } });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (!hasScopeAccess(authorization, student)) throw new PanelAuthorizationError(403, "You cannot collect a fee outside your assigned scope.");
    const scheme = student.feeSchemeId ? await prisma.feeScheme.findUnique({ where: { id: student.feeSchemeId }, select: { monthlyFee: true, classId: true } }) : null;
    if (!scheme || scheme.classId !== student.classId) return NextResponse.json({ error: "This student has no valid fee scheme." }, { status: 409 });

    const result = await prisma.$transaction(async (tx) => {
      const collections = [];
      for (const month of months) {
        const year = month < 4 ? academicYear + 1 : academicYear;
        const fee = await tx.monthlyFee.upsert({
          where: { studentId_month_year: { studentId, month, year } },
          update: {},
          create: { studentId, admissionId: student.finalAdmissionId, schoolId: student.schoolId, branchId: student.branchId, classId: student.classId, academicYear, month, year, dueDate: new Date(Date.UTC(year, month - 1, 1)), totalDue: scheme.monthlyFee, paidAmount: 0, status: "UNPAID", isWaived: false, waivedAmount: 0, fineAmount: 0 },
        });
        await tx.$queryRaw`SELECT "id" FROM "MonthlyFee" WHERE "id" = ${fee.id} FOR UPDATE`;
        const lockedFee = await tx.monthlyFee.findUnique({ where: { id: fee.id } });
        if (!lockedFee || lockedFee.status === "PAID" || lockedFee.status === "WAIVED") continue;
        const pending = await tx.provisionalFeeCollection.aggregate({ where: { monthlyFeeId: fee.id, status: { in: UNSETTLED_PROVISIONAL_COLLECTION_STATUSES } }, _sum: { amount: true } });
        const amount = feeOutstanding(lockedFee) - (pending._sum.amount || 0);
        if (amount <= 0) continue;
        const collection = await tx.provisionalFeeCollection.create({ data: { monthlyFeeId: fee.id, schoolId: student.schoolId, branchId: student.branchId, classId: student.classId, amount, method, transactionId, idempotencyKey: `legacy-${randomUUID()}`, submittedRemarks: remarks, collectorUserId: authorization.user.id } });
        collections.push({ collection, fee: lockedFee });
      }
      return collections;
    });
    for (const entry of result) {
      await appendFinanceAuditEvent({ actorUserId: authorization.user.id, action: "monthly_fee.collection.acknowledged", resource: "ProvisionalFeeCollection", resourceId: entry.collection.publicId, scope: collectionScope(entry.collection), afterData: { monthlyFeeId: entry.fee.id, amount: entry.collection.amount, method, transactionId, status: entry.collection.status } });
    }
    return NextResponse.json({ collections: result }, { status: result.length ? 201 : 200 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") return NextResponse.json({ error: error.message }, { status: error.status || 401 });
    console.error("[Monthly fee collection]", error);
    return NextResponse.json({ error: "Unable to acknowledge this collection." }, { status: 500 });
  }
}
