import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";
import { appendFinanceAuditEvent } from "@/src/lib/finance/scopedFees";

const METHODS = new Set(["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"]);

class FeeValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "FeeValidationError";
    this.status = status;
  }
}

function positiveInteger(value, name) {
  const number = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(number) || number <= 0) throw new FeeValidationError(`${name} must be a positive whole number.`);
  return number;
}

function errorResponse(error) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 401 });
  }
  if (error instanceof FeeValidationError || error?.name === "FeeValidationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  if (error && typeof error === "object" && error.code === "P2002") {
    return NextResponse.json({ error: "This payment reference was already recorded for one of the selected months." }, { status: 409 });
  }
  console.error("[Monthly fee payment]", error);
  return NextResponse.json({ error: "Failed to process payment." }, { status: 500 });
}

export async function POST(request) {
  try {
    // Final settlement is deliberately unavailable through this legacy route.
    // The caller must create a tracked provisional collection, then complete
    // COEF bank submission and Administration received confirmation.
    return NextResponse.json({ error: "Direct fee settlement is retired. Use the tracked collection workflow." }, { status: 409 });
    const authorization = await requirePanelPermission(request, "fee.manage");
    const body = await request.json();
    const studentId = positiveInteger(body?.studentId, "studentId");
    const academicYear = positiveInteger(body?.academicYear, "academicYear");
    if (academicYear < 2000 || academicYear > 2100) throw new FeeValidationError("academicYear must be between 2000 and 2100.");
    const method = typeof body?.paymentMethod === "string" ? body.paymentMethod.trim().toUpperCase() : "";
    if (!METHODS.has(method)) throw new FeeValidationError("A valid paymentMethod is required.");
    const transactionId = typeof body?.transactionId === "string" && body.transactionId.trim() ? body.transactionId.trim() : null;
    if (transactionId && transactionId.length > 100) throw new FeeValidationError("transactionId is too long.");
    if (method !== "CASH" && !transactionId) throw new FeeValidationError("transactionId is required for non-cash payments.");
    const remarks = typeof body?.remarks === "string" ? body.remarks.trim().slice(0, 300) || null : null;

    if (!Array.isArray(body?.months) || body.months.length === 0 || body.months.length > 12) {
      throw new FeeValidationError("Select between one and twelve fee months.");
    }
    const monthNumbers = body.months.map((item) => positiveInteger(typeof item === "object" ? item.month : item, "month"));
    if (monthNumbers.some((month) => month < 1 || month > 12) || new Set(monthNumbers).size !== monthNumbers.length) {
      throw new FeeValidationError("months must contain unique calendar months from 1 to 12.");
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      select: { id: true, schoolId: true, branchId: true, classId: true, finalAdmissionId: true, feeSchemeId: true },
    });
    if (!student) return NextResponse.json({ error: "Student not found." }, { status: 404 });
    if (!hasScopeAccess(authorization, student)) throw new PanelAuthorizationError(403, "You cannot record a fee outside your assigned scope.");
    if (!student.feeSchemeId) return NextResponse.json({ error: "This student has no fee scheme." }, { status: 409 });

    const scheme = await prisma.feeScheme.findUnique({
      where: { id: student.feeSchemeId },
      select: { id: true, classId: true, monthlyFee: true },
    });
    if (!scheme || scheme.classId !== student.classId) return NextResponse.json({ error: "The student's fee scheme is invalid for this class." }, { status: 409 });
    const totalDue = scheme.monthlyFee;

    const records = await prisma.$transaction(async (tx) => {
      const output = [];
      for (const month of monthNumbers) {
        const year = month < 4 ? academicYear + 1 : academicYear;
        const fee = await tx.monthlyFee.upsert({
          where: { studentId_month_year: { studentId: student.id, month, year } },
          update: {},
          create: {
            studentId: student.id,
            admissionId: student.finalAdmissionId,
            schoolId: student.schoolId,
            branchId: student.branchId,
            classId: student.classId,
            academicYear,
            month,
            year,
            dueDate: new Date(Date.UTC(year, month - 1, 1)),
            totalDue,
            paidAmount: 0,
            status: "UNPAID",
            isWaived: false,
            waivedAmount: 0,
            fineAmount: 0,
          },
        });
        // Serializes every settlement for this ledger row, including cash
        // payments that do not have an external gateway reference.
        await tx.$queryRaw`SELECT "id" FROM "MonthlyFee" WHERE "id" = ${fee.id} FOR UPDATE`;
        const lockedFee = await tx.monthlyFee.findUnique({ where: { id: fee.id } });
        if (!lockedFee) throw new FeeValidationError("Monthly fee was not found after locking.", 409);
        if (transactionId) {
          const existing = await tx.monthlyFeePayment.findFirst({ where: { monthlyFeeId: lockedFee.id, transactionId } });
          if (existing) {
            output.push({ fee: lockedFee, payment: existing, idempotent: true });
            continue;
          }
        }
        const outstanding = Math.max(0, (lockedFee.totalDue + (lockedFee.fineAmount || 0)) - lockedFee.paidAmount - (lockedFee.waivedAmount || 0));
        if (outstanding <= 0) {
          output.push({ fee: lockedFee, payment: null, alreadySettled: true });
          continue;
        }
        const paidAmount = lockedFee.paidAmount + outstanding;
        const updatedFee = await tx.monthlyFee.update({
          where: { id: lockedFee.id },
          data: { paidAmount, status: "PAID", remarks },
        });
        const payment = await tx.monthlyFeePayment.create({
          data: {
            monthlyFeeId: lockedFee.id,
            amount: outstanding,
            method,
            transactionId,
            receivedBy: String(authorization.user.id),
            remarks,
          },
        });
        output.push({ fee: updatedFee, payment });
      }
      return output;
    });

    const createdPayment = records.some((record) => record.payment && !record.idempotent);
    if (createdPayment) {
      await appendFinanceAuditEvent({
        actorUserId: authorization.user.id,
        action: "monthly_fee.payment.record",
        resource: "MonthlyFeePayment",
        resourceId: transactionId || `${student.id}:${academicYear}`,
        scope: { scopeType: "CLASS", schoolId: student.schoolId, branchId: student.branchId, classId: student.classId },
        afterData: { studentId: student.id, academicYear, months: monthNumbers, paymentMethod: method, transactionId },
      });
    }
    return NextResponse.json({ monthlyFeePayments: records }, { status: createdPayment ? 201 : 200 });
  } catch (error) {
    return errorResponse(error);
  }
}
