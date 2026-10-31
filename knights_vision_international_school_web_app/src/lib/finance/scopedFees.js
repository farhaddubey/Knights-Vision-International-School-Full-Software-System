import prisma from "@/src/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  PanelAuthorizationError,
  hasScopeAccess,
} from "@/src/lib/rbac/authorization";

export const FEE_CATEGORIES = new Set([
  "KSAT_SUPPORT_PLUS",
  "KSAT_SUPPORT",
  "KSAT_STANDARD",
  "KSAT_GENERAL",
  "DIRECT_GENERAL",
]);

export function positiveInteger(value, field) {
  const result = Number(value);
  if (!Number.isInteger(result) || result <= 0) {
    throw new PanelAuthorizationError(400, `${field} must be a positive whole number.`);
  }
  return result;
}

export function pagination(searchParams, defaultPageSize = 10) {
  const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10) || 1);
  const requestedPageSize = Number.parseInt(searchParams.get("pageSize") || String(defaultPageSize), 10);
  const pageSize = Math.min(Math.max(requestedPageSize || defaultPageSize, 1), 200);
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function feeAmount(value, field, { required = true } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0) {
    throw new PanelAuthorizationError(400, `${field} must be a non-negative number.`);
  }
  return result;
}

export function feeCategory(value) {
  const result = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!FEE_CATEGORIES.has(result)) {
    throw new PanelAuthorizationError(400, "category is invalid.");
  }
  return result;
}

export async function schoolClassById(classId) {
  const id = positiveInteger(classId, "classId");
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id },
    select: { id: true, schoolId: true, branchId: true, name: true, section: true },
  });
  if (!schoolClass) throw new PanelAuthorizationError(404, "Class not found.");
  return schoolClass;
}

export async function scopedSchoolClass(authorization, classId, message = "You cannot access this class.") {
  const schoolClass = await schoolClassById(classId);
  if (!hasScopeAccess(authorization, schoolClass)) {
    throw new PanelAuthorizationError(403, message);
  }
  return schoolClass;
}

export async function scopedFeeScheme(authorization, feeSchemeId, message = "You cannot access this fee scheme.") {
  const id = positiveInteger(feeSchemeId, "fee scheme id");
  const feeScheme = await prisma.feeScheme.findUnique({
    where: { id },
    include: { class: { select: { id: true, schoolId: true, branchId: true, name: true, section: true } } },
  });
  if (!feeScheme) throw new PanelAuthorizationError(404, "Fee scheme not found.");
  if (!hasScopeAccess(authorization, feeScheme.class)) {
    throw new PanelAuthorizationError(403, message);
  }
  return feeScheme;
}

export function financeErrorResponse(error, fallback) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return { status: error.status || 401, body: { error: error.message } };
  }
  if (error?.code === "P2002") {
    return { status: 409, body: { error: "A record with these values already exists." } };
  }
  if (error?.code === "P2003") {
    return { status: 409, body: { error: "This record is in use and cannot be removed." } };
  }
  if (error?.code === "P2025") {
    return { status: 404, body: { error: "The requested record was not found." } };
  }
  console.error("[Finance access]", error);
  return { status: 500, body: { error: fallback } };
}

// A completed payment must never be reported as failed merely because its
// secondary audit write is temporarily unavailable. The ledger transaction is
// already authoritative; log the audit outage for operational follow-up.
export async function appendFinanceAuditEvent(input) {
  try {
    return await appendEnterpriseAuditEvent(input);
  } catch (error) {
    console.error("[Finance audit] Unable to append audit event after a committed financial operation.", error);
    return null;
  }
}
