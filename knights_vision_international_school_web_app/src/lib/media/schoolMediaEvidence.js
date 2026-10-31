import { PanelAuthorizationError, hasScopeAccess } from "@/src/lib/rbac/authorization";

export const SCHOOL_EVIDENCE_REASONS = Object.freeze({
  EVENT_DOCUMENTATION: "Event documentation",
  ACTIVITY_DOCUMENTATION: "School activity documentation",
  STUDENT_ACHIEVEMENT: "Student achievement",
  FACILITY_MAINTENANCE: "Facility or maintenance verification",
  SAFETY_INCIDENT: "Safety incident documentation",
  ADMISSIONS_VERIFICATION: "Admissions verification",
  COMPLIANCE_DOCUMENT: "Compliance document",
  NOTICE_OR_CIRCULAR: "Notice or circular evidence",
  OTHER_AUTHORISED: "Other authorised school evidence",
});

const PRINCIPAL_SUBMITTER_ROLES = new Set(["PRINCIPAL"]);
const ADMINISTRATIVE_REVIEWER_ROLES = new Set(["CEO", "CTO"]);
const RETENTION_DAYS = 90;

function roleCodes(authorization) {
  return new Set([
    ...(authorization?.roles || []).map((role) => String(role.code || "").trim().toUpperCase()),
    String(authorization?.user?.role || "").trim().toUpperCase(),
  ]);
}

export function isEvidenceSubmitter(authorization) {
  const roles = roleCodes(authorization);
  return [...PRINCIPAL_SUBMITTER_ROLES].some((role) => roles.has(role));
}

export function isEvidenceAdministrator(authorization) {
  const roles = roleCodes(authorization);
  return [...ADMINISTRATIVE_REVIEWER_ROLES].some((role) => roles.has(role));
}

export function assertEvidenceSubmitter(authorization) {
  if (!isEvidenceSubmitter(authorization)) {
    throw new PanelAuthorizationError(403, "Only the assigned Principal can submit school evidence from the Faculty Panel.");
  }
}

export function assertEvidenceAdministrator(authorization) {
  if (!isEvidenceAdministrator(authorization)) {
    throw new PanelAuthorizationError(403, "Only CEO or CTO Administration can verify or delete school evidence.");
  }
}

export function assertEvidenceScope(authorization, evidence) {
  if (!hasScopeAccess(authorization, { schoolId: evidence.schoolId, branchId: evidence.branchId })) {
    throw new PanelAuthorizationError(403, "This evidence belongs to a school or branch outside your assigned scope.");
  }
}

export function evidenceReason(value) {
  const reason = String(value || "").trim().toUpperCase();
  if (!Object.hasOwn(SCHOOL_EVIDENCE_REASONS, reason)) {
    throw new PanelAuthorizationError(400, "Choose a valid evidence reason.");
  }
  return reason;
}

export function evidenceDescription(value) {
  const description = String(value || "").trim();
  if (description.length < 12 || description.length > 1000) {
    throw new PanelAuthorizationError(400, "Provide an evidence description between 12 and 1000 characters.");
  }
  return description;
}

export function reviewNote(value) {
  const note = String(value || "").trim();
  if (note.length < 5 || note.length > 1000) {
    throw new PanelAuthorizationError(400, "Provide a review note between 5 and 1000 characters.");
  }
  return note;
}

export function retentionDate(from = new Date()) {
  const date = new Date(from);
  date.setUTCDate(date.getUTCDate() + RETENTION_DAYS);
  return date;
}

export function evidenceFileUrl(id) {
  return `/api/faculty-evidence/${id}/file`;
}

export function evidenceView(evidence) {
  return {
    id: evidence.id,
    schoolId: evidence.schoolId,
    branchId: evidence.branchId,
    school: evidence.school ? { id: evidence.school.id, name: evidence.school.name } : null,
    branch: evidence.branch ? { id: evidence.branch.id, name: evidence.branch.name, code: evidence.branch.code } : null,
    reason: evidence.reason,
    reasonLabel: SCHOOL_EVIDENCE_REASONS[evidence.reason] || evidence.reason,
    description: evidence.description,
    status: evidence.status,
    submittedAt: evidence.submittedAt,
    submittedBy: evidence.submittedBy ? {
      id: evidence.submittedBy.id,
      username: evidence.submittedBy.username,
      email: evidence.submittedBy.email,
    } : null,
    reviewedAt: evidence.reviewedAt,
    reviewedBy: evidence.reviewedBy ? {
      id: evidence.reviewedBy.id,
      username: evidence.reviewedBy.username,
      email: evidence.reviewedBy.email,
    } : null,
    verificationNote: evidence.verificationNote,
    deleteEligibleAt: evidence.deleteEligibleAt,
    canDelete: Boolean(evidence.deleteEligibleAt && new Date(evidence.deleteEligibleAt).getTime() <= Date.now()),
    file: evidence.file ? {
      id: evidence.file.id,
      name: evidence.file.name,
      mime: evidence.file.mime,
      size: Number(evidence.file.size),
      url: evidenceFileUrl(evidence.id),
    } : null,
  };
}
