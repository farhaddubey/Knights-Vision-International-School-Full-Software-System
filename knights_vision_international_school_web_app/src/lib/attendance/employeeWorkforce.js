import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  hasPermission,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const staffSelect = {
  id: true,
  username: true,
  email: true,
  role: true,
  schoolId: true,
  branchId: true,
  per_day_salary: true,
};

function positiveInteger(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validYear(value) {
  const parsed = positiveInteger(value);
  return parsed && parsed >= 2000 && parsed <= 2100 ? parsed : null;
}

function validMonth(value) {
  const parsed = positiveInteger(value);
  return parsed && parsed >= 1 && parsed <= 12 ? parsed : null;
}

function pagination(searchParams) {
  const page = Math.max(positiveInteger(searchParams.get("page")) || 1, 1);
  const pageSize = Math.min(Math.max(positiveInteger(searchParams.get("pageSize")) || 20, 1), 100);
  return { page, pageSize, skip: (page - 1) * pageSize };
}

function decimalString(value, fallback = null) {
  return value == null ? fallback : value.toString();
}

function dateString(value) {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value.toISOString().split("T")[0] : null;
}

function localDayRange(rawDate) {
  const value = String(rawDate || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const start = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

function monthRange(year, month) {
  return {
    start: new Date(Date.UTC(year, month - 1, 1)),
    end: new Date(Date.UTC(year, month, 1)),
  };
}

function staffScope(employee) {
  return { schoolId: employee.schoolId, branchId: employee.branchId };
}

function assertScope(authorization, employee) {
  if (!hasScopeAccess(authorization, staffScope(employee))) {
    throw new PanelAuthorizationError(403, "You do not have access to this employee's school or branch scope.");
  }
}

function assertPermission(authorization, permission, message) {
  if (!hasPermission(authorization, permission)) {
    throw new PanelAuthorizationError(403, message);
  }
}

async function loadEmployee(employeeId) {
  const employee = await prisma.user.findUnique({ where: { id: employeeId }, select: staffSelect });
  if (!employee) throw new PanelAuthorizationError(404, "Employee not found.");
  return employee;
}

/**
 * Staff may always read their own records.  Cross-staff attendance needs both
 * people visibility and attendance visibility, so a classroom assignment cannot
 * be used to browse the workforce ledger.
 */
export async function authorizeEmployeeAttendanceRead(request, employeeId) {
  const authorization = await requirePanelPermission(request, "panel.access");
  const employee = await loadEmployee(employeeId);

  if (authorization.user.id !== employee.id) {
    assertPermission(authorization, "staff.read", "Staff attendance requires staff-read permission.");
    assertPermission(authorization, "attendance.read", "Staff attendance requires attendance-read permission.");
    assertScope(authorization, employee);
  }

  return { authorization, employee };
}

/**
 * Payroll history is more sensitive than timekeeping.  A user can see their own
 * history, while cross-staff reads require the finance-read grant at the
 * employee's real school/branch scope.
 */
export async function authorizeEmployeeSalaryRead(request, employeeId) {
  const authorization = await requirePanelPermission(request, "panel.access");
  const employee = await loadEmployee(employeeId);

  if (authorization.user.id !== employee.id) {
    assertPermission(authorization, "payroll.read", "Salary history requires payroll-read permission.");
    assertScope(authorization, employee);
  }

  return { authorization, employee };
}

export async function authorizeEmployeeAttendanceManage(request, employeeId) {
  const authorization = await requirePanelPermission(request, "panel.access");
  assertPermission(authorization, "staff.manage", "Employee attendance changes require staff-manage permission.");
  assertPermission(authorization, "attendance.manage", "Employee attendance changes require attendance-manage permission.");
  const employee = await loadEmployee(employeeId);
  assertScope(authorization, employee);
  return { authorization, employee };
}

export async function authorizeEmployeePayrollManage(request, employeeId) {
  const authorization = await requirePanelPermission(request, "panel.access");
  assertPermission(authorization, "payroll.manage", "Payroll changes require payroll-manage permission.");
  const employee = await loadEmployee(employeeId);
  assertScope(authorization, employee);
  return { authorization, employee };
}

async function authorizeEmployeeAttendanceList(request) {
  const authorization = await requirePanelPermission(request, "panel.access");
  assertPermission(authorization, "staff.read", "Employee attendance requires staff-read permission.");
  assertPermission(authorization, "attendance.read", "Employee attendance requires attendance-read permission.");
  return authorization;
}

async function authorizeEmployeeSalaryList(request) {
  const authorization = await requirePanelPermission(request, "panel.access");
  assertPermission(authorization, "payroll.read", "Salary history requires payroll-read permission.");
  return authorization;
}

function scopedEmployeeWhere(authorization) {
  if (authorization.scopes.some((scope) => scope.scopeType === "GLOBAL")) return {};

  const scopes = authorization.scopes.flatMap((scope) => {
    if (scope.scopeType === "SCHOOL" && scope.schoolId != null) return [{ schoolId: scope.schoolId }];
    if (scope.scopeType === "BRANCH" && scope.branchId != null) return [{ branchId: scope.branchId }];
    return [];
  });

  return scopes.length ? { OR: scopes } : { id: { in: [] } };
}

function serializeAttendance(log, includeUsername = false) {
  return {
    id: log.id,
    user_id: log.user_id,
    ...(includeUsername ? { username: log.user?.username || "Unknown" } : {}),
    date: dateString(log.date),
    entry_time: log.entry_time,
    leave_time: log.leave_time,
    total_hours: decimalString(log.total_hours, "0"),
    late_minutes: decimalString(log.late_minutes, "0"),
    penalty: decimalString(log.penalty, "0"),
    overtime_minutes: decimalString(log.overtime_minutes, "0"),
    overtime_salary: decimalString(log.overtime_salary, "0"),
    bonus_salary_per_day: decimalString(log.bonus_salary_per_day, "0"),
    base_salary_per_day: decimalString(log.base_salary_per_day, "0"),
    net_salary_of_the_day: decimalString(log.net_salary_of_the_day, "0"),
    created_at: log.created_at?.toISOString?.() || null,
    updated_at: log.updated_at?.toISOString?.() || null,
    published_at: log.published_at?.toISOString?.() || null,
    created_by_id: log.created_by_id ?? null,
    updated_by_id: log.updated_by_id ?? null,
  };
}

export function serializeSalary(salary) {
  return {
    id: salary.id,
    user_id: salary.user_id,
    total_hours_worked: decimalString(salary.total_hours_worked, "0"),
    payment_status: salary.payment_status || "Unknown",
    allowances: decimalString(salary.allowances, "0"),
    total_late_deduction: decimalString(salary.total_late_deduction, "0"),
    total_overtime_bonus: decimalString(salary.total_overtime_bonus, "0"),
    total_sell_bonus: decimalString(salary.total_sell_bonus, "0"),
    net_salary: decimalString(salary.net_salary, "0"),
    salary_paid: decimalString(salary.salary_paid, "0"),
    remaining_salary_of_month: decimalString(salary.remaining_salary_of_month, "0"),
    month_year: dateString(salary.month_year),
    created_at: salary.created_at?.toISOString?.() || null,
    updated_at: salary.updated_at?.toISOString?.() || null,
    published_at: salary.published_at?.toISOString?.() || null,
    created_by_id: salary.created_by_id ?? null,
    updated_by_id: salary.updated_by_id ?? null,
  };
}

function numericValue(value) {
  const number = Number.parseFloat(value ?? 0);
  return Number.isFinite(number) ? number : 0;
}

function employeeIdFromSearch(request, name = "userId") {
  return positiveInteger(new URL(request.url).searchParams.get(name));
}

export function employeeWorkforceErrorResponse(error) {
  if (error instanceof PanelAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  console.error("[Employee workforce access]", error);
  return NextResponse.json({ error: "Unable to process the employee workforce request." }, { status: 500 });
}

export async function getEmployeeAttendanceForDay(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = positiveInteger(searchParams.get("user"));
    const day = localDayRange(searchParams.get("date"));
    if (!employeeId || !day) return NextResponse.json({ error: "A valid user and date are required." }, { status: 400 });

    await authorizeEmployeeAttendanceRead(request, employeeId);
    const logs = await prisma.employee_attendance_logs.findMany({
      where: { user_id: employeeId, date: { gte: day.start, lt: day.end } },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(logs.map((log) => serializeAttendance(log)));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function listEmployeeAttendance(request) {
  try {
    const authorization = await authorizeEmployeeAttendanceList(request);
    const searchParams = new URL(request.url).searchParams;
    const { page, pageSize, skip } = pagination(searchParams);
    const day = searchParams.get("date") ? localDayRange(searchParams.get("date")) : null;
    if (searchParams.get("date") && !day) return NextResponse.json({ error: "Date must use YYYY-MM-DD." }, { status: 400 });

    const where = {
      user: scopedEmployeeWhere(authorization),
      ...(day ? { date: { gte: day.start, lt: day.end } } : {}),
    };
    const [logs, total] = await Promise.all([
      prisma.employee_attendance_logs.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { id: "desc" },
        include: { user: { select: { id: true, username: true } } },
      }),
      prisma.employee_attendance_logs.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map((log) => serializeAttendance(log, true)),
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeAttendanceForMonth(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = employeeIdFromSearch(request);
    const year = validYear(searchParams.get("year")) || new Date().getFullYear();
    const month = validMonth(searchParams.get("month")) || new Date().getMonth() + 1;
    if (!employeeId) return NextResponse.json({ error: "A valid userId is required." }, { status: 400 });

    const { employee } = await authorizeEmployeeAttendanceRead(request, employeeId);
    const { start, end } = monthRange(year, month);
    const logs = await prisma.employee_attendance_logs.findMany({
      where: { user_id: employeeId, date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    });

    return NextResponse.json({
      user_id: employee.id,
      username: employee.username,
      role: employee.role || "",
      per_day_salary: decimalString(employee.per_day_salary, "0"),
      attendance_logs: logs.map((log) => serializeAttendance(log)),
    });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeAttendanceMonthLogs(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = employeeIdFromSearch(request);
    const year = validYear(searchParams.get("year"));
    const month = validMonth(searchParams.get("month"));
    if (!employeeId || !year || !month) {
      return NextResponse.json({ error: "A valid userId, year, and month are required." }, { status: 400 });
    }

    await authorizeEmployeeAttendanceRead(request, employeeId);
    const { start, end } = monthRange(year, month);
    const logs = await prisma.employee_attendance_logs.findMany({
      where: { user_id: employeeId, date: { gte: start, lt: end } },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ logs: logs.map((log) => serializeAttendance(log)) });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeAttendanceHistory(request) {
  try {
    const employeeId = employeeIdFromSearch(request);
    if (!employeeId) return NextResponse.json({ error: "A valid userId is required." }, { status: 400 });
    await authorizeEmployeeAttendanceRead(request, employeeId);
    const logs = await prisma.employee_attendance_logs.findMany({ where: { user_id: employeeId }, orderBy: { date: "desc" } });
    return NextResponse.json(logs.map((log) => serializeAttendance(log)));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeAttendanceLog(request, rawLogId) {
  try {
    const logId = positiveInteger(rawLogId);
    if (!logId) return NextResponse.json({ error: "A valid attendance log ID is required." }, { status: 400 });
    const log = await prisma.employee_attendance_logs.findUnique({ where: { id: logId }, include: { user: { select: staffSelect } } });
    if (!log || !log.user_id || !log.user) return NextResponse.json({ error: "Attendance log not found." }, { status: 404 });
    await authorizeEmployeeAttendanceRead(request, log.user_id);
    return NextResponse.json(serializeAttendance(log));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function createEmployeeAttendanceLog(request) {
  try {
    const body = await request.json();
    const employeeId = positiveInteger(body.user_id);
    const day = localDayRange(body.date);
    if (!employeeId || !day || !body.entry_time) {
      return NextResponse.json({ error: "A valid user_id, date, and entry_time are required." }, { status: 400 });
    }

    const { authorization } = await authorizeEmployeeAttendanceManage(request, employeeId);
    const now = new Date();
    const log = await prisma.employee_attendance_logs.create({
      data: {
        user_id: employeeId,
        date: day.start,
        entry_time: String(body.entry_time),
        leave_time: body.leave_time ? String(body.leave_time) : null,
        total_hours: numericValue(body.total_hours),
        late_minutes: numericValue(body.late_minutes),
        penalty: numericValue(body.penalty),
        overtime_minutes: numericValue(body.overtime_minutes),
        overtime_salary: numericValue(body.overtime_salary),
        bonus_salary_per_day: numericValue(body.bonus_salary_per_day),
        base_salary_per_day: numericValue(body.base_salary_per_day),
        net_salary_of_the_day: numericValue(body.net_salary_of_the_day),
        created_at: now,
        updated_at: now,
        created_by_id: authorization.user.id,
        updated_by_id: authorization.user.id,
      },
    });
    return NextResponse.json(serializeAttendance(log), { status: 201 });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function updateEmployeeAttendanceLog(request, rawLogId) {
  try {
    const logId = positiveInteger(rawLogId);
    if (!logId) return NextResponse.json({ error: "A valid attendance log ID is required." }, { status: 400 });
    const current = await prisma.employee_attendance_logs.findUnique({ where: { id: logId } });
    if (!current?.user_id) return NextResponse.json({ error: "Attendance log not found." }, { status: 404 });

    const body = await request.json();
    const suppliedEmployeeId = positiveInteger(body.user_id);
    const day = localDayRange(body.date);
    if (!suppliedEmployeeId || suppliedEmployeeId !== current.user_id || !day || !body.entry_time || !body.leave_time || body.net_salary_of_the_day === undefined) {
      return NextResponse.json({ error: "Attendance employee, date, entry_time, leave_time, and net salary are required; changing the employee is not allowed." }, { status: 400 });
    }

    const { authorization } = await authorizeEmployeeAttendanceManage(request, current.user_id);
    const values = {
      totalHours: numericValue(body.total_hours),
      lateMinutes: numericValue(body.late_minutes),
      penalty: numericValue(body.penalty),
      overtimeMinutes: numericValue(body.overtime_minutes),
      overtimeSalary: numericValue(body.overtime_salary),
      bonusSalary: numericValue(body.bonus_salary_per_day),
      baseSalary: numericValue(body.base_salary_per_day),
      netSalary: numericValue(body.net_salary_of_the_day),
    };
    const delta = {
      totalHours: values.totalHours - numericValue(current.total_hours),
      penalty: values.penalty - numericValue(current.penalty),
      overtimeSalary: values.overtimeSalary - numericValue(current.overtime_salary),
      bonusSalary: values.bonusSalary - numericValue(current.bonus_salary_per_day),
      netSalary: values.netSalary - numericValue(current.net_salary_of_the_day),
    };
    const monthYear = new Date(Date.UTC(day.start.getUTCFullYear(), day.start.getUTCMonth(), 1));

    // Preserve the legacy daily-to-monthly aggregation; this phase adds
    // authorization and audit ownership, not a new payroll calculation model.
    const result = await prisma.$transaction(async (tx) => {
      const updatedLog = await tx.employee_attendance_logs.update({
        where: { id: logId },
        data: {
          date: day.start,
          entry_time: String(body.entry_time),
          leave_time: String(body.leave_time),
          total_hours: values.totalHours,
          late_minutes: values.lateMinutes,
          penalty: values.penalty,
          overtime_minutes: values.overtimeMinutes,
          overtime_salary: values.overtimeSalary,
          bonus_salary_per_day: values.bonusSalary,
          base_salary_per_day: values.baseSalary,
          net_salary_of_the_day: values.netSalary,
          updated_at: new Date(),
          updated_by_id: authorization.user.id,
        },
      });

      let salary = await tx.employee_salaries.findFirst({
        where: { user_id: current.user_id, month_year: monthYear },
        include: { employee_salaries_attendance_logs_links: true },
      });

      if (!salary) {
        salary = await tx.employee_salaries.create({
          data: {
            user_id: current.user_id,
            month_year: monthYear,
            total_hours_worked: Math.max(0, values.totalHours),
            payment_status: "Pending",
            allowances: 0,
            total_late_deduction: Math.max(0, values.penalty),
            total_overtime_bonus: Math.max(0, values.overtimeSalary),
            total_sell_bonus: Math.max(0, values.bonusSalary),
            net_salary: Math.max(0, values.netSalary),
            salary_paid: 0,
            remaining_salary_of_month: Math.max(0, values.netSalary),
            created_at: new Date(),
            updated_at: new Date(),
            created_by_id: authorization.user.id,
            updated_by_id: authorization.user.id,
            employee_salaries_attendance_logs_links: {
              create: { employee_attendance_log_id: logId, employee_attendance_log_order: 1 },
            },
          },
          include: { employee_salaries_attendance_logs_links: true },
        });
      } else {
        salary = await tx.employee_salaries.update({
          where: { id: salary.id },
          data: {
            total_hours_worked: Math.max(0, numericValue(salary.total_hours_worked) + delta.totalHours),
            total_late_deduction: Math.max(0, numericValue(salary.total_late_deduction) + delta.penalty),
            total_overtime_bonus: Math.max(0, numericValue(salary.total_overtime_bonus) + delta.overtimeSalary),
            total_sell_bonus: Math.max(0, numericValue(salary.total_sell_bonus) + delta.bonusSalary),
            net_salary: Math.max(0, numericValue(salary.net_salary) + delta.netSalary),
            remaining_salary_of_month: Math.max(0, numericValue(salary.remaining_salary_of_month) + delta.netSalary),
            updated_at: new Date(),
            updated_by_id: authorization.user.id,
            employee_salaries_attendance_logs_links: salary.employee_salaries_attendance_logs_links.some((link) => link.employee_attendance_log_id === logId)
              ? undefined
              : { create: { employee_attendance_log_id: logId, employee_attendance_log_order: salary.employee_salaries_attendance_logs_links.length + 1 } },
          },
        });
      }
      return { updatedLog, salary };
    });

    return NextResponse.json({ ...serializeAttendance(result.updatedLog), salary_record: serializeSalary(result.salary) });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function deleteEmployeeAttendanceLog(request, rawLogId) {
  try {
    const logId = positiveInteger(rawLogId);
    if (!logId) return NextResponse.json({ error: "A valid attendance log ID is required." }, { status: 400 });
    const log = await prisma.employee_attendance_logs.findUnique({ where: { id: logId } });
    if (!log?.user_id) return NextResponse.json({ error: "Attendance log not found." }, { status: 404 });
    await authorizeEmployeeAttendanceManage(request, log.user_id);
    await prisma.$transaction([
      prisma.employee_attendance_logs_user_links.deleteMany({ where: { employee_attendance_log_id: logId } }),
      prisma.employee_salaries_attendance_logs_links.deleteMany({ where: { employee_attendance_log_id: logId } }),
      prisma.employee_attendance_logs.delete({ where: { id: logId } }),
    ]);
    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function updateEmployeeMidVerification(request, rawLogId) {
  try {
    const logId = positiveInteger(rawLogId);
    if (!logId) return NextResponse.json({ error: "A valid attendance log ID is required." }, { status: 400 });
    const log = await prisma.employee_attendance_logs.findUnique({ where: { id: logId } });
    if (!log?.user_id) return NextResponse.json({ error: "Attendance log not found." }, { status: 404 });
    await authorizeEmployeeAttendanceManage(request, log.user_id);
    return NextResponse.json({ error: "Mid-day verification is unavailable because the current attendance schema has no verification fields." }, { status: 409 });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeSalaryPage(request, employeeId) {
  try {
    const targetId = positiveInteger(employeeId);
    if (!targetId) return NextResponse.json({ error: "A valid employee ID is required." }, { status: 400 });
    await authorizeEmployeeSalaryRead(request, targetId);
    const { page, pageSize, skip } = pagination(new URL(request.url).searchParams);
    const where = { user_id: targetId };
    const [salaries, total] = await Promise.all([
      prisma.employee_salaries.findMany({ where, orderBy: { month_year: "desc" }, skip, take: pageSize }),
      prisma.employee_salaries.count({ where }),
    ]);
    return NextResponse.json({ salaries: salaries.map(serializeSalary), total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeSalaryYear(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = employeeIdFromSearch(request);
    const year = validYear(searchParams.get("year"));
    if (!employeeId || !year) return NextResponse.json({ error: "A valid userId and year are required." }, { status: 400 });
    await authorizeEmployeeSalaryRead(request, employeeId);
    const salaries = await prisma.employee_salaries.findMany({
      where: { user_id: employeeId, month_year: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) } },
      orderBy: { month_year: "asc" },
    });
    return NextResponse.json(salaries.map(serializeSalary));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeSalaryMonth(request) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = employeeIdFromSearch(request, "userId") || employeeIdFromSearch(request, "user");
    const monthYear = String(searchParams.get("monthYear") || "");
    if (!employeeId || !/^\d{4}-(0[1-9]|1[0-2])$/.test(monthYear)) {
      return NextResponse.json({ error: "A valid userId and monthYear (YYYY-MM) are required." }, { status: 400 });
    }
    await authorizeEmployeeSalaryRead(request, employeeId);
    const [year, month] = monthYear.split("-").map(Number);
    const { start, end } = monthRange(year, month);
    const salaries = await prisma.employee_salaries.findMany({
      where: { user_id: employeeId, month_year: { gte: start, lt: end } },
      orderBy: { month_year: "asc" },
    });
    return NextResponse.json(salaries.map(serializeSalary));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function listEmployeeSalariesForMonth(request) {
  try {
    const authorization = await authorizeEmployeeSalaryList(request);
    const searchParams = new URL(request.url).searchParams;
    const year = validYear(searchParams.get("year"));
    const month = validMonth(searchParams.get("month"));
    if (!year || !month) return NextResponse.json({ error: "A valid year and month are required." }, { status: 400 });

    const { start, end } = monthRange(year, month);
    const salaries = await prisma.employee_salaries.findMany({
      where: { month_year: { gte: start, lt: end }, user: scopedEmployeeWhere(authorization) },
      include: { user: { select: { id: true, username: true } } },
      orderBy: { id: "desc" },
    });
    return NextResponse.json(salaries.map((salary) => ({
      ...serializeSalary(salary),
      username: salary.user?.username || "Unknown",
    })));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}

export async function getEmployeeSalaryPayments(request, byYear = false) {
  try {
    const searchParams = new URL(request.url).searchParams;
    const employeeId = employeeIdFromSearch(request);
    const year = byYear ? validYear(searchParams.get("year")) : null;
    if (!employeeId || (byYear && !year)) return NextResponse.json({ error: byYear ? "A valid userId and year are required." : "A valid userId is required." }, { status: 400 });
    await authorizeEmployeeSalaryRead(request, employeeId);
    const payments = await prisma.salary_paid_logs.findMany({
      where: {
        user_id: employeeId,
        ...(year ? { paid_on: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) } } : {}),
      },
      include: { salary: { select: { month_year: true } }, paid_by_user: { select: { username: true } } },
      orderBy: { paid_on: "desc" },
    });
    return NextResponse.json(payments.map((payment) => ({
      id: payment.id,
      user_id: payment.user_id,
      salary_id: payment.salary_id,
      paid_amount: decimalString(payment.paid_amount, "0"),
      payment_mode: payment.payment_mode || "Unknown",
      note: payment.note || null,
      paid_on: payment.paid_on?.toISOString?.() || null,
      paid_by_user_id: payment.paid_by_user_id ?? null,
      paid_by: payment.paid_by_user?.username || null,
      salary: payment.salary ? { month_year: dateString(payment.salary.month_year) } : null,
      created_at: payment.created_at?.toISOString?.() || null,
      updated_at: payment.updated_at?.toISOString?.() || null,
    })));
  } catch (error) {
    return employeeWorkforceErrorResponse(error);
  }
}
