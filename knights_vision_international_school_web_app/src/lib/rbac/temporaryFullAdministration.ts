import type { PanelAuthorization } from "@/src/lib/rbac/authorization";

const temporaryFullAdministrationRoleCodes = new Set(["SYSTEM_ADMIN", "CEO", "COO", "CFO"]);

/**
 * A migration-only menu override. It is deliberately opt-in and can never be
 * enabled in production. It changes discovery only; every API keeps its own
 * permission and scope check.
 */
export function isTemporaryFullAdministrationEnabled() {
  return process.env.NODE_ENV !== "production"
    && process.env.SSPS_ENABLE_TEMPORARY_FULL_ADMIN_ACCESS === "true";
}

export function hasTemporaryFullAdministrationAccess(authorization: PanelAuthorization) {
  if (!isTemporaryFullAdministrationEnabled()) return false;

  return authorization.roles.some((role) =>
    temporaryFullAdministrationRoleCodes.has(String(role.code).trim().toUpperCase()),
  );
}

