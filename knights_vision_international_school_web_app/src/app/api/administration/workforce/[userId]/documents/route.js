import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  buildScopeWhere,
  hasPermission,
  requireAdministrationPermission,
} from "@/src/lib/rbac/authorization";

const documentTypes = new Set([
  "OFFER_LETTER",
  "EMPLOYMENT_CERTIFICATE",
  "EXPERIENCE_CERTIFICATE",
  "WORK_HISTORY",
  "SALARY_STATEMENT",
  "SALARY_PAYMENT_HISTORY",
]);

function positiveId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toIso(value) {
  return value?.toISOString?.() || null;
}

function decimal(value, fallback = "0") {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function targetScope(user) {
  return {
    scopeType: user.branchId ? "BRANCH" : user.schoolId ? "SCHOOL" : "GLOBAL",
    schoolId: user.schoolId || null,
    branchId: user.branchId || null,
    classId: null,
  };
}

async function scopedEmployee(authorization, userId) {
  const scope = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
  return prisma.user.findFirst({
    where: { id: userId, AND: [scope] },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      role_teacher: true,
      department: true,
      created_at: true,
      is_active: true,
      blocked: true,
      schoolId: true,
      branchId: true,
      base_salary: true,
      salary_system: true,
      school: { select: { id: true, name: true } },
      branch: { select: { id: true, name: true, code: true } },
      accessRoleAssignments: {
        where: { isActive: true },
        orderBy: { createdAt: "asc" },
        select: {
          startsAt: true,
          endsAt: true,
          createdAt: true,
          role: { select: { code: true, name: true } },
        },
      },
      workforceAssignments: {
        orderBy: { createdAt: "asc" },
        select: {
          assignmentKind: true,
          roleCode: true,
          startsAt: true,
          endsAt: true,
          isActive: true,
          source: true,
          createdAt: true,
        },
      },
    },
  });
}

function serializeEmployee(user, { includePayroll = false } = {}) {
  return {
    id: user.id,
    username: user.username || "Staff member",
    email: user.email,
    role: user.role || user.role_teacher || null,
    department: user.department || null,
    createdAt: toIso(user.created_at),
    isActive: user.is_active !== false && user.blocked !== true,
    school: user.school,
    branch: user.branch,
    // Compensation configuration is finance data. The document workspace may
    // still issue non-finance certificates for staff.read users, but it must
    // never disclose a base salary unless payroll.read has also been granted.
    baseSalary: includePayroll ? decimal(user.base_salary, "") : "",
    salarySystem: includePayroll ? user.salary_system || null : null,
    roleHistory: user.accessRoleAssignments.map((assignment) => ({
      role: assignment.role,
      startsAt: toIso(assignment.startsAt) || toIso(assignment.createdAt),
      endsAt: toIso(assignment.endsAt),
    })),
    workforceHistory: user.workforceAssignments.map((assignment) => ({
      assignmentKind: assignment.assignmentKind,
      roleCode: assignment.roleCode,
      startsAt: toIso(assignment.startsAt) || toIso(assignment.createdAt),
      endsAt: toIso(assignment.endsAt),
      isActive: assignment.isActive,
      source: assignment.source,
    })),
  };
}

function serializeSalary(salary) {
  return {
    id: salary.id,
    monthYear: toIso(salary.month_year),
    paymentStatus: salary.payment_status || "Not recorded",
    totalHoursWorked: decimal(salary.total_hours_worked),
    netSalary: decimal(salary.net_salary),
    salaryPaid: decimal(salary.salary_paid),
    remainingSalary: decimal(salary.remaining_salary_of_month),
    allowances: decimal(salary.allowances),
    lateDeduction: decimal(salary.total_late_deduction),
    overtimeBonus: decimal(salary.total_overtime_bonus),
  };
}

function serializePayment(payment) {
  return {
    id: payment.id,
    paidOn: toIso(payment.paid_on),
    salaryMonth: toIso(payment.salary?.month_year),
    amount: decimal(payment.paid_amount),
    mode: payment.payment_mode || "Not recorded",
    note: payment.note || null,
    paidBy: payment.paid_by_user?.username || null,
  };
}

async function audit(authorization, employee, action, metadata = {}) {
  await prisma.accessAuditLog.create({
    data: {
      actorUserId: authorization.user.id,
      targetUserId: employee.id,
      action,
      resource: "EmployeeDocument",
      resourceId: String(employee.id),
      ...targetScope(employee),
      metadata,
    },
  });
}

export async function GET(request, { params }) {
  try {
    const authorization = await requireAdministrationPermission(request, "staff.read");
    const { userId: rawUserId } = await params;
    const userId = positiveId(rawUserId);
    if (!userId) return NextResponse.json({ error: "A valid employee ID is required." }, { status: 400 });

    const employee = await scopedEmployee(authorization, userId);
    if (!employee) return NextResponse.json({ error: "Employee not found in your authorized scope." }, { status: 404 });

    const canReadPayroll = hasPermission(authorization, "payroll.read");
    const [salaries, payments] = canReadPayroll
      ? await Promise.all([
        prisma.employee_salaries.findMany({
          where: { user_id: employee.id },
          orderBy: { month_year: "desc" },
          take: 60,
        }),
        prisma.salary_paid_logs.findMany({
          where: { user_id: employee.id },
          orderBy: { paid_on: "desc" },
          take: 250,
          include: {
            salary: { select: { month_year: true } },
            paid_by_user: { select: { username: true } },
          },
        }),
      ])
      : [[], []];

    await audit(authorization, employee, "staff.document_data.read", { includesPayroll: canReadPayroll });
    return NextResponse.json({
      employee: serializeEmployee(employee, { includePayroll: canReadPayroll }),
      payroll: canReadPayroll ? { salaries: salaries.map(serializeSalary), payments: payments.map(serializePayment) } : null,
      capabilities: { payrollDocuments: canReadPayroll },
    });
  } catch (error) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Administration employee documents GET]", error);
    return NextResponse.json({ error: "Unable to load employee document data." }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const authorization = await requireAdministrationPermission(request, "staff.read");
    const { userId: rawUserId } = await params;
    const userId = positiveId(rawUserId);
    const body = await request.json().catch(() => ({}));
    const documentType = String(body.documentType || "").trim();
    if (!userId || !documentTypes.has(documentType)) {
      return NextResponse.json({ error: "A valid employee and document type are required." }, { status: 400 });
    }

    const employee = await scopedEmployee(authorization, userId);
    if (!employee) return NextResponse.json({ error: "Employee not found in your authorized scope." }, { status: 404 });
    if (["SALARY_STATEMENT", "SALARY_PAYMENT_HISTORY"].includes(documentType) && !hasPermission(authorization, "payroll.read")) {
      return NextResponse.json({ error: "You do not have permission to generate payroll documents." }, { status: 403 });
    }

    await audit(authorization, employee, "staff.document.generated", {
      documentType,
      reference: String(body.reference || "").slice(0, 80) || null,
      generatedClientSide: true,
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Administration employee documents POST]", error);
    return NextResponse.json({ error: "Unable to register the employee document." }, { status: 500 });
  }
}
