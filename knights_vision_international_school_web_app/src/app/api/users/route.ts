import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { DepartmentType, SalarySystem, UserRole } from "@prisma/client";
import prisma from "@/src/lib/prisma";
import { buildScopeWhere, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";

function nonEmptyText(value: unknown, maximum = 255) {
  if (typeof value !== "string") return null;
  const normalized = value.trim();
  return normalized && normalized.length <= maximum ? normalized : null;
}

function nullableText(value: unknown, maximum = 255) {
  if (value === null || value === undefined || value === "") return null;
  return nonEmptyText(value, maximum);
}

function optionalNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function optionalInteger(value: unknown) {
  const parsed = optionalNumber(value);
  return parsed !== null && Number.isInteger(parsed) ? parsed : null;
}

function optionalBigInt(value: unknown) {
  const text = nullableText(value, 30);
  if (!text) return null;
  if (!/^\d+$/.test(text)) throw new Error("INVALID_PHONE");
  return BigInt(text);
}

function validEnum<T extends Record<string, string>>(value: unknown, source: T, field: string) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !Object.values(source).includes(value)) {
    const error = new Error(`INVALID_${field}`);
    throw error;
  }
  return value as T[keyof T];
}

function pageValue(value: string | null, fallback: number, maximum = 100) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, maximum) : fallback;
}

export async function GET(req: NextRequest) {
  try {
    // This endpoint also feeds legacy attendance/assignment selectors. Its
    // response is deliberately safe, so any authenticated panel user may read
    // only staff in their own server-derived school or branch scope.
    const authorization = await requirePanelPermission(req, "panel.access");
    const url = new URL(req.url);
    const page = pageValue(url.searchParams.get("page"), 1, 100000);
    const pageSize = pageValue(url.searchParams.get("pageSize"), 20);
    const where = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: [{ username: "asc" }, { id: "asc" }],
        select: {
          id: true, branchId: true, schoolId: true, username: true, email: true, role: true, role_teacher: true,
          department: true, is_active: true, blocked: true, confirmed: true, img_url: true,
          school: { select: { id: true, name: true } }, branch: { select: { id: true, name: true, code: true } },
        },
      }),
      prisma.user.count({ where }),
    ]);
    return NextResponse.json({ users, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) });
  } catch (error: any) {
    const status = error?.status || 500;
    if (status === 401 || status === 403) return NextResponse.json({ error: error.message }, { status });
    console.error("[Users list]", error);
    return NextResponse.json({ error: "Unable to load staff records." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authorization = await requirePanelPermission(req, "staff.manage");
    const body = await req.json();
    const username = nullableText(body.username);
    const email = nonEmptyText(body.email)?.toLowerCase();
    const password = typeof body.password === "string" ? body.password : "";
    const schoolId = optionalInteger(body.schoolId);
    const branchId = optionalInteger(body.branchId);

    if (!username || !email || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "A staff name and valid email are required." }, { status: 400 });
    }
    if (password.length < 12) {
      return NextResponse.json({ error: "Set a unique initial password of at least 12 characters; government ID values are never used as passwords." }, { status: 400 });
    }
    if (!schoolId || !branchId) {
      return NextResponse.json({ error: "A school and branch are required for every staff account." }, { status: 400 });
    }
    const branch = await prisma.schoolBranch.findFirst({ where: { id: branchId, schoolId }, select: { id: true, schoolId: true } });
    if (!branch) return NextResponse.json({ error: "The selected branch does not belong to the selected school." }, { status: 400 });
    if (!hasScopeAccess(authorization, { schoolId: branch.schoolId, branchId: branch.id })) {
      return NextResponse.json({ error: "You cannot create staff accounts outside your assigned school or branch." }, { status: 403 });
    }

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: await bcrypt.hash(password, 12),
        schoolId,
        branchId,
        is_active: body.is_active !== false,
        blocked: body.blocked === true,
        confirmed: body.confirmed === true,
        role: validEnum(body.role, UserRole, "ROLE"),
        department: validEnum(body.department, DepartmentType, "DEPARTMENT"),
        salary_system: validEnum(body.salary_system, SalarySystem, "SALARY_SYSTEM"),
        prefered_language: nullableText(body.prefered_language),
        rfid_card_no: nullableText(body.rfid_card_no, 20),
        biometric_id: nullableText(body.biometric_id),
        aggrement_work_hours_per_day: optionalNumber(body.aggrement_work_hours_per_day),
        base_salary: optionalNumber(body.base_salary),
        extra_per_half_hour_salary: optionalNumber(body.extra_per_half_hour_salary),
        regular_entry_time: nullableText(body.regular_entry_time, 8),
        regular_leave_time: nullableText(body.regular_leave_time, 8),
        per_day_bonus_salary: optionalNumber(body.per_day_bonus_salary),
        per_day_salary: optionalNumber(body.per_day_salary),
        img_url: nullableText(body.img_url, 500),
        clg_name: nullableText(body.clg_name),
        highest_degree: nullableText(body.highest_degree),
        highest_marks: nullableText(body.highest_marks),
        years_experience: optionalInteger(body.years_experience),
        specialization: nullableText(body.specialization),
        bio: nullableText(body.bio, 10000),
        languages_known: nullableText(body.languages_known),
        address: nullableText(body.address),
        fatherName: nullableText(body.fatherName),
        motherName: nullableText(body.motherName),
        phone1: optionalBigInt(body.phone1),
        phone2: optionalBigInt(body.phone2),
        phone3: optionalBigInt(body.phone3),
        uid_aadhar: optionalBigInt(body.uid_aadhar),
        village: nullableText(body.village),
        block: nullableText(body.block || body.city_or_block),
        municiple: nullableText(body.municiple),
        police_station: nullableText(body.police_station),
        district: nullableText(body.district),
        state: nullableText(body.state),
        country: nullableText(body.country),
        pincode: nullableText(body.pincode, 20),
        phone_prefix: nullableText(body.phone_prefix, 20),
        whatsapp: nullableText(body.whatsapp, 20),
        aadhar_verified: body.aadhar_verified === true,
        created_at: new Date(),
        updated_at: new Date(),
        created_by_id: authorization.user.id,
        updated_by_id: authorization.user.id,
      },
      select: { id: true, username: true, email: true, schoolId: true, branchId: true, role: true, is_active: true },
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "staff.create",
      resource: "User",
      resourceId: user.id,
      scope: { scopeType: "BRANCH", schoolId: user.schoolId, branchId: user.branchId, classId: null },
      afterData: { username: user.username, email: user.email, role: user.role },
    });
    return NextResponse.json({ message: "Staff account created. Provide the chosen initial password only through an approved channel.", user }, { status: 201 });
  } catch (error: any) {
    if (error?.status === 401 || error?.status === 403) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error?.code === "P2002") return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    if (String(error?.message || "").startsWith("INVALID_")) return NextResponse.json({ error: "One of the selected staff role, department, salary system, or contact values is not valid." }, { status: 400 });
    console.error("[Staff create]", error);
    return NextResponse.json({ error: "Unable to create the staff account." }, { status: 500 });
  }
}
