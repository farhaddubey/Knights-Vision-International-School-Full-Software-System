import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  PanelAuthorizationError,
  buildScopeWhere,
  getPanelAuthorization,
  hasPermission,
  hasScopeAccess,
  type PanelAuthorization,
  type StaffSessionPanel,
} from "@/src/lib/rbac/authorization";
import { hasTemporaryFullAdministrationAccess } from "@/src/lib/rbac/temporaryFullAdministration";

export const policyExceptionCategories = [
  "FINANCIAL",
  "ACADEMIC",
  "STAFF",
  "OPERATIONAL",
  "MARKETING",
  "COMMUNICATIONS",
  "EXECUTIVE",
] as const;

export const policyExceptionStatuses = [
  "SUBMITTED",
  "UNDER_REVIEW",
  "APPROVED",
  "REJECTED",
  "EXECUTION_VERIFIED",
  "CLOSED",
  "CANCELLED",
] as const;

type PolicyExceptionCategory = (typeof policyExceptionCategories)[number];
type PolicyExceptionStatus = (typeof policyExceptionStatuses)[number];

const responsibleRoleByCategory: Record<PolicyExceptionCategory, string> = {
  FINANCIAL: "CFO",
  ACADEMIC: "CAO",
  STAFF: "CHRO",
  OPERATIONAL: "COO",
  MARKETING: "CMO",
  COMMUNICATIONS: "CCO",
  EXECUTIVE: "CEO",
};

export const policyExceptionInclude = {
  school: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true, code: true } },
  class: { select: { id: true, name: true, section: true, academicYear: true } },
  requestedBy: { select: { id: true, username: true, email: true } },
  decidedBy: { select: { id: true, username: true, email: true } },
  executionVerifiedBy: { select: { id: true, username: true, email: true } },
  events: {
    orderBy: { createdAt: "asc" as const },
    include: { actor: { select: { id: true, username: true, email: true } } },
  },
};

function asPositiveInteger(value: unknown, field: string, required = false) {
  if (value === undefined || value === null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }

  const number = Number(value);
  if (!Number.isInteger(number) || number <= 0) {
    throw new PanelAuthorizationError(400, `${field} must be a positive whole number.`);
  }
  return number;
}

function text(value: unknown, field: string, min: number, max: number, required = true) {
  const normalized = typeof value === "string" ? value.trim() : "";
  if (!normalized && !required) return null;
  if (normalized.length < min || normalized.length > max) {
    throw new PanelAuthorizationError(400, `${field} must contain ${min}-${max} characters.`);
  }
  return normalized;
}

function category(value: unknown): PolicyExceptionCategory {
  const normalized = String(value || "").trim().toUpperCase();
  if (!policyExceptionCategories.includes(normalized as PolicyExceptionCategory)) {
    throw new PanelAuthorizationError(400, "A valid policy-exception category is required.");
  }
  return normalized as PolicyExceptionCategory;
}

function action(value: unknown) {
  const normalized = String(value || "").trim().toUpperCase();
  const actions = new Set(["REVIEW", "APPROVE", "REJECT", "VERIFY_EXECUTION", "CLOSE", "CANCEL"]);
  if (!actions.has(normalized)) {
    throw new PanelAuthorizationError(400, "A valid workflow action is required.");
  }
  return normalized;
}

function requestPanel(request: Request): StaffSessionPanel {
  const panel = String(request.headers.get("x-ssps-panel") || "").trim().toUpperCase();
  if (panel === "ADMINISTRATION" || panel === "FACULTIES") return panel;
  throw new PanelAuthorizationError(400, "The protected panel context is required.");
}

export async function policyExceptionAuthorization(request: Request) {
  const authorization = await getPanelAuthorization(request, requestPanel(request));
  if (!authorization) throw new PanelAuthorizationError(401, "Authentication is required.");
  return authorization;
}

export function assertPolicyExceptionScope(authorization: PanelAuthorization, record: { schoolId: number; branchId: number | null; classId: number | null }) {
  if (!hasScopeAccess(authorization, record)) {
    throw new PanelAuthorizationError(403, "You do not have access to this school, branch, or class scope.");
  }
}

export function assertCanSubmitPolicyException(authorization: PanelAuthorization) {
  if (!hasPermission(authorization, "approval.submit")) {
    throw new PanelAuthorizationError(403, "You do not have permission to submit a policy exception.");
  }
}

export function canReadAllPolicyExceptions(authorization: PanelAuthorization) {
  return hasPermission(authorization, "approval.read");
}

export function canDecidePolicyException(authorization: PanelAuthorization, routedRoleCode: string) {
  if (!hasPermission(authorization, "approval.manage")) return false;
  const roleCodes = new Set(authorization.roles.map((role) => role.code.toUpperCase()));
  if (roleCodes.has(routedRoleCode.toUpperCase())) return true;

  // Development-only migration support for the four explicitly approved
  // headquarters accounts. Production always requires the routed executive.
  return hasTemporaryFullAdministrationAccess(authorization);
}

export async function resolvePolicyExceptionSubmission(raw: unknown, authorization: PanelAuthorization) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new PanelAuthorizationError(400, "A policy-exception payload is required.");
  }

  const payload = raw as Record<string, unknown>;
  const schoolId = asPositiveInteger(payload.schoolId, "schoolId", true)!;
  const branchId = asPositiveInteger(payload.branchId, "branchId");
  const classId = asPositiveInteger(payload.classId, "classId");
  const academicYear = payload.academicYear == null || payload.academicYear === ""
    ? null
    : asPositiveInteger(payload.academicYear, "academicYear");
  const selectedCategory = category(payload.category);
  const title = text(payload.title, "Title", 5, 160)!;
  const reason = text(payload.reason, "Reason", 15, 5000)!;
  const supportingInformation = text(payload.supportingInformation, "Supporting information", 0, 5000, false);
  const requestedChange = payload.requestedChange;

  if (!requestedChange || typeof requestedChange !== "object" || Array.isArray(requestedChange)) {
    throw new PanelAuthorizationError(400, "Requested change must be a structured object.");
  }
  if (!hasScopeAccess(authorization, { schoolId, branchId, classId })) {
    throw new PanelAuthorizationError(403, "The requested policy exception is outside your assigned scope.");
  }

  const school = await prisma.school.findUnique({ where: { id: schoolId }, select: { id: true } });
  if (!school) throw new PanelAuthorizationError(400, "The selected institution does not exist.");

  if (branchId) {
    const branch = await prisma.schoolBranch.findFirst({ where: { id: branchId, schoolId }, select: { id: true } });
    if (!branch) throw new PanelAuthorizationError(400, "The selected branch does not belong to the institution.");
  }
  if (classId) {
    const schoolClass = await prisma.schoolClass.findFirst({
      where: { id: classId, schoolId, ...(branchId ? { branchId } : {}) },
      select: { id: true },
    });
    if (!schoolClass) throw new PanelAuthorizationError(400, "The selected class does not match the institution and branch.");
  }

  return {
    schoolId,
    branchId,
    classId,
    academicYear,
    category: selectedCategory,
    routedRoleCode: responsibleRoleByCategory[selectedCategory],
    title,
    reason,
    requestedChange,
    supportingInformation,
    requestedById: authorization.user.id,
  };
}

export function policyExceptionScopeWhere(authorization: PanelAuthorization, ownOnly = false) {
  const scoped = buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
  return ownOnly ? { AND: [scoped, { requestedById: authorization.user.id }] } : scoped;
}

export function policyExceptionError(error: unknown, fallback = "Unable to process the policy exception.") {
  if (error instanceof PanelAuthorizationError) {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status });
  }
  console.error("[Policy exception]", error);
  return NextResponse.json({ success: false, message: fallback }, { status: 500 });
}

export async function writePolicyExceptionTransition(
  recordId: number,
  raw: unknown,
  authorization: PanelAuthorization,
) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new PanelAuthorizationError(400, "A policy-exception workflow payload is required.");
  }
  const payload = raw as Record<string, unknown>;
  const requestedAction = action(payload.action);
  const note = text(payload.note, "Workflow note", 10, 5000)!;

  const current = await prisma.policyException.findUnique({ where: { id: recordId } });
  if (!current) throw new PanelAuthorizationError(404, "Policy exception not found.");
  assertPolicyExceptionScope(authorization, current);

  const currentStatus = current.status as PolicyExceptionStatus;
  const isRequester = current.requestedById === authorization.user.id;
  const mayDecide = canDecidePolicyException(authorization, current.routedRoleCode);
  let nextStatus: PolicyExceptionStatus;
  let actionName: string;
  let data: Record<string, unknown> = {};

  if (requestedAction === "REVIEW") {
    if (!mayDecide || !["SUBMITTED", "UNDER_REVIEW"].includes(currentStatus)) {
      throw new PanelAuthorizationError(403, "Only the routed headquarters executive may review this submitted exception.");
    }
    nextStatus = "UNDER_REVIEW";
    actionName = "policy_exception.review";
  } else if (requestedAction === "APPROVE" || requestedAction === "REJECT") {
    if (!mayDecide || !["SUBMITTED", "UNDER_REVIEW"].includes(currentStatus)) {
      throw new PanelAuthorizationError(403, "Only the routed headquarters executive may make this decision.");
    }
    nextStatus = requestedAction === "APPROVE" ? "APPROVED" : "REJECTED";
    actionName = requestedAction === "APPROVE" ? "policy_exception.approve" : "policy_exception.reject";
    data = { decidedById: authorization.user.id, decisionNote: note, decidedAt: new Date() };
  } else if (requestedAction === "VERIFY_EXECUTION") {
    if (currentStatus !== "APPROVED" || !isRequester) {
      throw new PanelAuthorizationError(403, "Only the original submitting officer may verify execution after approval.");
    }
    nextStatus = "EXECUTION_VERIFIED";
    actionName = "policy_exception.verify_execution";
    data = { executionVerifiedById: authorization.user.id, executionNote: note, executionVerifiedAt: new Date() };
  } else if (requestedAction === "CLOSE") {
    if (!mayDecide || currentStatus !== "EXECUTION_VERIFIED") {
      throw new PanelAuthorizationError(403, "Only the routed headquarters executive may close a verified exception.");
    }
    nextStatus = "CLOSED";
    actionName = "policy_exception.close";
  } else {
    if (!isRequester || currentStatus !== "SUBMITTED") {
      throw new PanelAuthorizationError(403, "Only the requester may cancel an unreviewed policy exception.");
    }
    nextStatus = "CANCELLED";
    actionName = "policy_exception.cancel";
  }

  const updated = await prisma.$transaction(async (tx) => {
    const saved = await tx.policyException.update({
      where: { id: current.id },
      data: { ...data, status: nextStatus },
      include: policyExceptionInclude,
    });
    await tx.policyExceptionEvent.create({
      data: {
        policyExceptionId: current.id,
        actorUserId: authorization.user.id,
        action: actionName,
        fromStatus: current.status,
        toStatus: nextStatus,
        note,
      },
    });
    return saved;
  });

  await appendEnterpriseAuditEvent({
    actorUserId: authorization.user.id,
    action: actionName,
    resource: "PolicyException",
    resourceId: updated.publicId,
    scope: { scopeType: updated.classId ? "CLASS" : updated.branchId ? "BRANCH" : "SCHOOL", schoolId: updated.schoolId, branchId: updated.branchId, classId: updated.classId },
    beforeData: { status: current.status, routedRoleCode: current.routedRoleCode },
    afterData: { status: updated.status },
  });
  return updated;
}
