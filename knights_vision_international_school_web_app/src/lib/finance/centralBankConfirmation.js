import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

const centralConfirmationRoleCodes = new Set(["SYSTEM_ADMIN", "CEO", "COO", "CFO"]);

export function centralFinanceRoleCodes(authorization) {
  return new Set([
    authorization?.user?.role,
    ...(authorization?.roles || []).map((role) => role.code),
  ].filter(Boolean).map((role) => String(role).trim().toUpperCase()));
}

/**
 * A final receipt is a headquarters decision, not an extension of the school
 * COEF workflow. Permission and administration-panel authentication are both
 * checked by the route; this role guard keeps an accidental grant to another
 * headquarters position from silently creating a financial settlement.
 */
export function assertCentralBankConfirmationAuthority(authorization) {
  const roles = centralFinanceRoleCodes(authorization);
  if (![...centralConfirmationRoleCodes].some((role) => roles.has(role))) {
    throw new PanelAuthorizationError(403, "Only SYSTEM_ADMIN, CEO, COO, or CFO may confirm a school bank credit.");
  }
}

export function requiredBankCreditReference(value) {
  const reference = typeof value === "string" ? value.trim() : "";
  if (!reference || reference.length > 100) {
    throw new PanelAuthorizationError(400, "A bank-credit confirmation reference of up to 100 characters is required.");
  }
  return reference;
}

export function bankCreditDate(value) {
  if (!value) return new Date();
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new PanelAuthorizationError(400, "bankCreditDate must use YYYY-MM-DD.");
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) throw new PanelAuthorizationError(400, "bankCreditDate is invalid.");
  return date;
}

export const CENTRAL_CONFIRMATION_ROLE_CODES = centralConfirmationRoleCodes;
