import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import { buildScopeWhere, hasPermission, requirePanelPermission } from "@/src/lib/rbac/authorization";

function validNumber(value, minimum, maximum, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum ? parsed : fallback;
}

function decimal(value) {
  return value == null ? "0" : value.toString();
}

export async function GET(request) {
  try {
    const authorization = await requirePanelPermission(request, "payroll.read");
    const { searchParams } = new URL(request.url);
    const year = validNumber(searchParams.get("year"), 2000, 2100, new Date().getUTCFullYear());
    const month = validNumber(searchParams.get("month"), 1, 12, new Date().getUTCMonth() + 1);
    const page = validNumber(searchParams.get("page"), 1, 100000, 1);
    const pageSize = validNumber(searchParams.get("pageSize"), 1, 100, 50);
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1));
    const staffScope = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const where = { month_year: { gte: start, lt: end }, user: { is: staffScope } };
    const [records, total] = await Promise.all([
      prisma.employee_salaries.findMany({
        where,
        orderBy: [{ user: { username: "asc" } }, { id: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          user: {
            select: {
              id: true, username: true, email: true, role: true, schoolId: true, branchId: true,
              school: { select: { name: true } },
              branch: { select: { name: true, code: true } },
            },
          },
        },
      }),
      prisma.employee_salaries.count({ where }),
    ]);
    return NextResponse.json({
      data: records.map((record) => ({
        id: record.id,
        userId: record.user_id,
        monthYear: record.month_year?.toISOString?.().slice(0, 7) || null,
        paymentStatus: record.payment_status || "Pending",
        netSalary: decimal(record.net_salary),
        salaryPaid: decimal(record.salary_paid),
        remainingSalary: decimal(record.remaining_salary_of_month),
        allowances: decimal(record.allowances),
        totalLateDeduction: decimal(record.total_late_deduction),
        totalOvertimeBonus: decimal(record.total_overtime_bonus),
        employee: record.user,
      })),
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
      period: { year, month },
      capabilities: { postPayment: hasPermission(authorization, "payroll.manage") },
    });
  } catch (error) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Administration payroll]", error);
    return NextResponse.json({ error: "Unable to load the faculty payroll ledger." }, { status: 500 });
  }
}
