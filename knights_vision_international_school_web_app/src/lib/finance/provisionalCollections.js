import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

export const PROVISIONAL_PAYMENT_METHODS = new Set(["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"]);

// These amounts remain reserved against a student's fee balance until the
// future Administration confirmation stage either settles or rejects them.
// Excluding an approved/banked collection here would allow a second officer to
// collect the same balance before the final ledger entry exists.
export const UNSETTLED_PROVISIONAL_COLLECTION_STATUSES = [
  "PENDING_HANDOVER",
  "PENDING_VERIFICATION", // legacy records created before the handover stage
  "HANDED_OVER",
  "COEF_APPROVED",
  "BANK_SUBMITTED",
];

// Phase 2 deliberately owns the ledger-settlement action. Keep it opt-in so a
// deployed school cannot accidentally issue final receipts before the Central
// Administration workspace and review workflow are in place.
export function isAdministrationReceiptConfirmationEnabled() {
  return String(process.env.SSPS_ENABLE_ADMIN_RECEIPT_CONFIRMATION || "").trim().toLowerCase() === "true";
}

export function roleCodes(authorization) {
  return new Set([
    authorization?.user?.role,
    ...(authorization?.roles || []).map((role) => role.code),
  ].filter(Boolean).map((role) => String(role).trim().toUpperCase()));
}

export function isCollectionOfficer(authorization) {
  const roles = roleCodes(authorization);
  return ["GCI", "HOD", "HEAD_OF_DEPARTMENTS", "COEF"].some((role) => roles.has(role));
}

export function assertCollectionOfficer(authorization) {
  if (!isCollectionOfficer(authorization)) {
    throw new PanelAuthorizationError(403, "Only GCI, HOD, or COEF may record a guardian fee collection.");
  }
}

export function assertCoefVerifier(authorization) {
  if (!roleCodes(authorization).has("COEF")) {
    throw new PanelAuthorizationError(403, "Only the Controller of Finance and Examination can verify a provisional collection.");
  }
}

export function positiveAmount(value) {
  const amount = typeof value === "string" ? Number(value) : value;
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    throw new PanelAuthorizationError(400, "amount must be a positive number.");
  }
  return amount;
}

export function requiredIdempotencyKey(value) {
  const key = typeof value === "string" ? value.trim() : "";
  if (!key || key.length > 100) {
    throw new PanelAuthorizationError(400, "A valid idempotencyKey is required to submit a collection.");
  }
  return key;
}

export function paymentMethod(value) {
  const method = typeof value === "string" ? value.trim().toUpperCase() : "";
  if (!PROVISIONAL_PAYMENT_METHODS.has(method)) {
    throw new PanelAuthorizationError(400, "A valid payment method is required.");
  }
  return method;
}

export function transactionReference(value, method) {
  const transactionId = typeof value === "string" && value.trim() ? value.trim() : null;
  if (transactionId && transactionId.length > 100) {
    throw new PanelAuthorizationError(400, "transactionId is too long.");
  }
  if (method !== "CASH" && !transactionId) {
    throw new PanelAuthorizationError(400, "transactionId is required for non-cash payments.");
  }
  return transactionId;
}

export function optionalNote(value, field = "note") {
  if (value == null || value === "") return null;
  if (typeof value !== "string" || value.trim().length > 300) {
    throw new PanelAuthorizationError(400, `${field} must be at most 300 characters.`);
  }
  return value.trim() || null;
}

export function collectionScope(record) {
  return {
    scopeType: "CLASS",
    schoolId: record.schoolId,
    branchId: record.branchId,
    classId: record.classId,
  };
}

export function feeOutstanding(fee) {
  return Math.max(0, (fee.totalDue + (fee.fineAmount || 0)) - fee.paidAmount - (fee.waivedAmount || 0));
}
