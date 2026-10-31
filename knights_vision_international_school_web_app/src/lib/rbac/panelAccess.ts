import type { PanelAuthorization } from "@/src/lib/rbac/authorization";

export type StaffPanel = "ADMINISTRATION" | "FACULTIES";

const administrationRoleCodes = new Set([
  "SYSTEM_ADMIN",
  "CEO",
  "COO",
  "CFO",
  "CAO",
  "CHRO",
  "CTO",
  "CMO",
  "CCO",
  "CCA",
]);

const nonStaffRoleCodes = new Set(["STUDENT", "GUARDIAN"]);

function normalizedRoleCodes(authorization: PanelAuthorization) {
  return new Set(
    [...authorization.roles.map((role) => role.code), authorization.user.role]
      .filter(Boolean)
      .map((code) => String(code).trim().toUpperCase()),
  );
}

function isAssignedNonStudentStaff(authorization: PanelAuthorization) {
  const roles = normalizedRoleCodes(authorization);
  return [...roles].some((role) => !nonStaffRoleCodes.has(role));
}

/**
 * Central headquarters owns the Administration panel. School staff use the
 * Faculty panel to execute assigned work within their school, branch, and
 * class scope. A headquarters user is not silently treated as a school
 * operator; a deliberate scoped staff assignment is required for that.
 */
export function getStaffPanelDestination(authorization: PanelAuthorization): StaffPanel | null {
  const roles = normalizedRoleCodes(authorization);

  if (authorization.permissions.includes("*") || [...roles].some((role) => administrationRoleCodes.has(role))) {
    return "ADMINISTRATION";
  }

  if (isAssignedNonStudentStaff(authorization)) {
    return "FACULTIES";
  }

  return null;
}

export function canAccessStaffPanel(authorization: PanelAuthorization, panel: StaffPanel) {
  if (panel === "FACULTIES") return isAssignedNonStudentStaff(authorization) && getStaffPanelDestination(authorization) === "FACULTIES";

  return getStaffPanelDestination(authorization) === "ADMINISTRATION";
}

export function panelPath(panel: StaffPanel) {
  return panel === "ADMINISTRATION" ? "/administration" : "/knights-faculties-panel";
}
