import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  authorizeEmployeePayrollManage,
  employeeWorkforceErrorResponse,
  serializeSalary,
} from "@/src/lib/attendance/employeeWorkforce";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

const salaryFields = [
  "total_hours_worked",
  "allowances",
  "total_late_deduction",
  "total_overtime_bonus",
  "total_sell_bonus",
  "net_salary",
];

function positiveInteger(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function money(value, fieldName) {
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new PanelAuthorizationError(400, `${fieldName} must be a non-negative amount.`);
  }
  return parsed;
}

function monthStart(value) {
  const source = String(value ?? "").slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(source)) {
    throw new PanelAuthorizationError(400, "month_year must use YYYY-MM format.");
  }
  const [year, month] = source.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, 1));
}

function decimal(value) {
  return Number.parseFloat(value?.toString?.() ?? value ?? 0) || 0;
}

function paymentResponse(payment) {
  return {
    id: payment.id,
    user_id: payment.user_id,
    salary_id: payment.salary_id,
    paid_amount: payment.paid_amount.toString(),
    payment_mode: payment.payment_mode,
    note: payment.note,
    paid_on: payment.paid_on?.toISOString?.() || null,
  };
}

function controlledSalaryValues(body) {
  const values = {};
  for (const field of salaryFields) {
    if (body[field] !== undefined) values[field] = money(body[field], field);
  }
  return values;
}

async function payrollSalary(salaryId) {
  const salary = await prisma.employee_salaries.findUnique({
    where: { id: salaryId },
    include: { user: { select: { id: true, schoolId: true, branchId: true } }, salary_paid_logs: { select: { id: true }, take: 1 } },
  });
  if (!salary?.user_id || !salary.user) throw new PanelAuthorizationError(404, "Salary record not found.");
  return salary;
}

export async function createEmployeeSalary(request) {
  try {
    const body = await request.json();
    const employeeId = positiveInteger(body.user_id);
    if (!employeeId) return NextResponse.json({ error: "A valid user_id is required." }, { status: 400 });
    const monthYear = monthStart(body.month_year);
    const { authorization } = await authorizeEmployeePayrollManage(request, employeeId);
    const existing = await prisma.employee_salaries.findFirst({ where: { user_id: employeeId, month_year: monthYear }, select: { id: true } });
    if (existing) return NextResponse.json({ error: "A salary record already exists for this employee and month." }, { status: 409 });

    const values = controlledSalaryValues(body);
    const netSalary = values.net_salary ?? 0;
    const linkInputs = Array.isArray(body.employee_salaries_attendance_logs_links)
      ? body.employee_salaries_attendance_logs_links
      : [];
    const attendanceIds = [...new Set(linkInputs.map((link) => positiveInteger(link?.employee_attendance_log_id)).filter(Boolean))];
    if (attendanceIds.length !== linkInputs.length) {
      return NextResponse.json({ error: "Each salary attendance link must include a valid, unique attendance log ID." }, { status: 400 });
    }
    if (attendanceIds.length) {
      const validLogs = await prisma.employee_attendance_logs.count({ where: { id: { in: attendanceIds }, user_id: employeeId } });
      if (validLogs !== attendanceIds.length) {
        return NextResponse.json({ error: "Every linked attendance log must belong to the salary employee." }, { status: 400 });
      }
    }

    const now = new Date();
    const salary = await prisma.employee_salaries.create({
      data: {
        user_id: employeeId,
        month_year: monthYear,
        total_hours_worked: values.total_hours_worked ?? 0,
        payment_status: "Pending",
        allowances: values.allowances ?? 0,
        total_late_deduction: values.total_late_deduction ?? 0,
        total_overtime_bonus: values.total_overtime_bonus ?? 0,
        total_sell_bonus: values.total_sell_bonus ?? 0,
        net_salary: netSalary,
        salary_paid: 0,
        remaining_salary_of_month: netSalary,
        created_at: now,
        updated_at: now,
        created_by_id: authorization.user.id,
        updated_by_id: authorization.user.id,
        ...(attendanceIds.length ? {
          employee_salaries_attendance_logs_links: {
            create: attendanceIds.map((attendanceLogId, index) => ({
              employee_attendance_log_id: attendanceLogId,
              employee_attendance_log_order: index + 1,
            })),
          },
        } : {}),
      },
    });
    return NextResponse.json(serializeSalary(salary), { status: 201 });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function updateEmployeeSalary(request, rawSalaryId) {
  try {
    const salaryId = positiveInteger(rawSalaryId);
    if (!salaryId) return NextResponse.json({ error: "A valid salary ID is required." }, { status: 400 });
    const salary = await payrollSalary(salaryId);
    const { authorization } = await authorizeEmployeePayrollManage(request, salary.user_id);
    const body = await request.json();
    const values = controlledSalaryValues(body);
    if (Object.keys(values).length === 0) return NextResponse.json({ error: "No supported salary fields were supplied." }, { status: 400 });

    // Salary-paid and remaining-balance values are payment-ledger fields. They
    // are never accepted from the browser, even before the first payment.
    const netSalary = values.net_salary ?? decimal(salary.net_salary);
    const salaryPaid = decimal(salary.salary_paid);
    const remaining = Math.max(0, netSalary - salaryPaid);
    const paymentStatus = remaining === 0 && salaryPaid > 0
      ? "Paid"
      : salaryPaid > 0
        ? "Partially Paid"
        : "Pending";

    const updated = await prisma.employee_salaries.update({
      where: { id: salaryId },
      data: {
        ...values,
        net_salary: netSalary,
        remaining_salary_of_month: remaining,
        payment_status: paymentStatus,
        updated_at: new Date(),
        updated_by_id: authorization.user.id,
      },
    });
    return NextResponse.json(serializeSalary(updated));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function deleteEmployeeSalary(request, rawSalaryId) {
  try {
    const salaryId = positiveInteger(rawSalaryId);
    if (!salaryId) return NextResponse.json({ error: "A valid salary ID is required." }, { status: 400 });
    const salary = await payrollSalary(salaryId);
    await authorizeEmployeePayrollManage(request, salary.user_id);
    if (salary.salary_paid_logs.length || decimal(salary.salary_paid) > 0) {
      return NextResponse.json({ error: "A salary record with payments cannot be deleted." }, { status: 409 });
    }
    await prisma.employee_salaries.delete({ where: { id: salaryId } });
    return NextResponse.json({ message: "Record deleted successfully" });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function postEmployeeSalaryPayment(request, options = {}) {
  try {
    const body = await request.json();
    const salaryId = positiveInteger(body.salary_id);
    const requestedEmployeeId = positiveInteger(body.user_id);
    const paidAmount = money(body.paid_amount, "paid_amount");
    const paymentMode = typeof body.payment_mode === "string" ? body.payment_mode.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : null;
    if (!salaryId || !paidAmount || !paymentMode || paymentMode.length > 100 || (note && note.length > 255)) {
      return NextResponse.json({ error: "A valid salary_id, positive paid_amount, payment_mode, and optional short note are required." }, { status: 400 });
    }

    const salary = await payrollSalary(salaryId);
    if (requestedEmployeeId && requestedEmployeeId !== salary.user_id) {
      return NextResponse.json({ error: "The salary does not belong to the supplied employee." }, { status: 400 });
    }
    if (salary.salary_paid == null || salary.remaining_salary_of_month == null) {
      return NextResponse.json({ error: "This legacy salary record has no payment balance and must be normalized before posting a payment." }, { status: 409 });
    }
    const { authorization } = await authorizeEmployeePayrollManage(request, salary.user_id);

    const result = await prisma.$transaction(async (tx) => {
      // Conditional update is the balance guard: concurrent payment requests
      // cannot both reduce the same remaining salary below zero.
      const decreased = await tx.employee_salaries.updateMany({
        where: { id: salaryId, user_id: salary.user_id, remaining_salary_of_month: { gte: paidAmount } },
        data: {
          salary_paid: { increment: paidAmount },
          remaining_salary_of_month: { decrement: paidAmount },
          updated_at: new Date(),
          updated_by_id: authorization.user.id,
        },
      });
      if (decreased.count !== 1) {
        throw new PanelAuthorizationError(409, "The payment exceeds the current remaining salary or the record changed concurrently.");
      }
      const updatedSalary = await tx.employee_salaries.findUniqueOrThrow({ where: { id: salaryId } });
      const finalSalary = await tx.employee_salaries.update({
        where: { id: salaryId },
        data: { payment_status: decimal(updatedSalary.remaining_salary_of_month) <= 0 ? "Paid" : "Partially Paid" },
      });
      const payment = await tx.salary_paid_logs.create({
        data: {
          user_id: salary.user_id,
          salary_id: salaryId,
          paid_amount: paidAmount,
          payment_mode: paymentMode,
          note: note || null,
          paid_by_user_id: authorization.user.id,
          paid_on: new Date(),
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      return { payment, salary: finalSalary };
    });

    return NextResponse.json(options.response === "payment" ? paymentResponse(result.payment) : serializeSalary(result.salary), { status: options.response === "payment" ? 201 : 200 });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}
