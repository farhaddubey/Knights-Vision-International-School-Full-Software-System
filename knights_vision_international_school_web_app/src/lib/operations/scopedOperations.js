import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  buildScopeWhere,
  hasPermission,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const concernStatuses = new Set(["OPEN", "IN_PROGRESS", "RESOLVED", "ESCALATED", "CLOSED"]);
const concernCategories = new Set([
  "DISCIPLINE", "UNIFORM", "SYLLABUS", "HOMEWORK", "TEACHER_BEHAVIOR",
  "CLEANLINESS", "TRANSPORT", "EXTRACURRICULAR", "TIMETABLE", "OTHER",
]);
const operationalStatuses = new Set([
  "PENDING", "IN_PROGRESS", "ON_HOLD", "APPROVED", "REJECTED", "COMPLETED", "CANCELLED",
]);
const operationalPriorities = new Set(["LOW", "NORMAL", "HIGH", "URGENT"]);
const approvalStatuses = new Set(["APPROVED", "REJECTED"]);

export class OperationsValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "OperationsValidationError";
    this.status = status;
  }
}

const has = (input, key) => Object.prototype.hasOwnProperty.call(input, key);

function objectInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new OperationsValidationError("A JSON object is required.");
  }
  return input;
}

function positiveInteger(value, field) {
  const normalized = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new OperationsValidationError(`${field} must be a positive whole number.`);
  }
  return normalized;
}

function optionalPositiveInteger(input, key) {
  if (!has(input, key)) return undefined;
  if (input[key] === null || input[key] === "") return null;
  return positiveInteger(input[key], key);
}

function text(input, key, { required = false, max = 1000 } = {}) {
  if (!has(input, key)) {
    if (required) throw new OperationsValidationError(`${key} is required.`);
    return undefined;
  }
  const value = input[key];
  if (value === null || value === "") {
    if (required) throw new OperationsValidationError(`${key} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new OperationsValidationError(`${key} must be text.`);
  const normalized = value.trim();
  if (!normalized && required) throw new OperationsValidationError(`${key} is required.`);
  if (normalized.length > max) throw new OperationsValidationError(`${key} is too long.`);
  return normalized || null;
}

function enumValue(input, key, allowed, { required = false } = {}) {
  if (!has(input, key)) {
    if (required) throw new OperationsValidationError(`${key} is required.`);
    return undefined;
  }
  if (typeof input[key] !== "string" || !allowed.has(input[key])) {
    throw new OperationsValidationError(`${key} is not a supported value.`);
  }
  return input[key];
}

function setIfPresent(data, key, value) {
  if (value !== undefined) data[key] = value;
}

export const routeId = (value, label = "ID") => positiveInteger(value, label);

export const requireOperationsRead = (request) => requirePanelPermission(request, "operations.read");
export const requireOperationsManage = (request) => requirePanelPermission(request, "operations.manage");
export const requireApprovalManage = (request) => requirePanelPermission(request, "approval.manage");
export const requireConcernRead = (request) => requirePanelPermission(request, "guardian_communication.read");
export const requireConcernManage = (request) => requirePanelPermission(request, "guardian_communication.manage");

export function operationScopeWhere(authorization) {
  return buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });
}

export function concernScopeWhere(authorization) {
  return buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
}

export function assertScope(authorization, resource) {
  if (!hasScopeAccess(authorization, resource)) {
    throw new PanelAuthorizationError(403, "You do not have access to this school, branch, or class scope.");
  }
}

export async function resolveOperationalBranch(authorization, rawBranchId) {
  const branchId = positiveInteger(rawBranchId, "branchId");
  const branch = await prisma.schoolBranch.findUnique({
    where: { id: branchId },
    select: { id: true, schoolId: true, name: true, code: true },
  });
  if (!branch) throw new OperationsValidationError("Branch not found.", 404);
  assertScope(authorization, { schoolId: branch.schoolId, branchId: branch.id });
  return branch;
}

export async function assertAssigneeInScope(assigneeId, scope) {
  if (assigneeId === null || assigneeId === undefined) return null;
  const user = await prisma.user.findUnique({
    where: { id: assigneeId },
    select: { id: true, schoolId: true, branchId: true, is_active: true, blocked: true },
  });
  if (!user || user.is_active === false || user.blocked === true) {
    throw new OperationsValidationError("Assigned staff member is not active.", 404);
  }
  if (user.schoolId !== scope.schoolId || (user.branchId != null && user.branchId !== scope.branchId)) {
    throw new OperationsValidationError("Assigned staff member is outside the request branch.", 409);
  }
  return user.id;
}

export async function operationalRequestWriteData(input, authorization, { creating = false, existing = null } = {}) {
  const body = objectInput(input);
  const data = {};
  setIfPresent(data, "title", text(body, "title", { required: creating, max: 160 }));
  setIfPresent(data, "description", text(body, "description", { max: 5000 }));
  setIfPresent(data, "category", text(body, "category", { required: creating, max: 100 }));
  setIfPresent(data, "priority", enumValue(body, "priority", operationalPriorities));

  if (creating) {
    const branch = await resolveOperationalBranch(authorization, body.branchId);
    data.schoolId = branch.schoolId;
    data.branchId = branch.id;
    data.requestedById = authorization.user.id;
  }

  if (has(body, "branchId") && !creating) {
    throw new OperationsValidationError("An operational request cannot be moved to another branch.");
  }

  if (has(body, "assignedToId")) {
    const assignedToId = optionalPositiveInteger(body, "assignedToId");
    const scope = existing || data;
    data.assignedToId = await assertAssigneeInScope(assignedToId, scope);
  }

  if (has(body, "status")) {
    const status = enumValue(body, "status", operationalStatuses);
    if (creating && status !== "PENDING") {
      throw new OperationsValidationError("New operational requests always begin as PENDING.");
    }
    if (approvalStatuses.has(status) && !hasPermission(authorization, "approval.manage")) {
      throw new PanelAuthorizationError(403, "Approval permission is required for this decision.");
    }
    data.status = status;
    if (approvalStatuses.has(status)) {
      data.approvedById = authorization.user.id;
      data.decidedAt = new Date();
      setIfPresent(data, "decisionNote", text(body, "decisionNote", { max: 1000 }));
    } else if (has(body, "decisionNote") || has(body, "approvedById") || has(body, "decidedAt")) {
      throw new OperationsValidationError("Decision fields are managed only when approving or rejecting a request.");
    }
  }

  if (!creating && Object.keys(data).length === 0) {
    throw new OperationsValidationError("No permitted operational request fields were supplied.");
  }
  return data;
}

export async function schoolConcernCreateData(input, authorization) {
  const body = objectInput(input);
  const studentId = positiveInteger(body.studentId, "studentId");
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { id: true, schoolId: true, branchId: true, classId: true },
  });
  if (!student) throw new OperationsValidationError("Student not found.", 404);
  assertScope(authorization, student);
  return {
    studentId: student.id,
    schoolId: student.schoolId,
    branchId: student.branchId,
    classId: student.classId,
    category: enumValue(body, "category", concernCategories, { required: true }),
    description: text(body, "description", { required: true, max: 1000 }),
    submittedBy: enumValue(body, "submittedBy", new Set(["STUDENT", "GUARDIAN"])) || "GUARDIAN",
  };
}

export function schoolConcernUpdateData(input, authorization, existing = null) {
  const body = objectInput(input);
  const data = {};
  setIfPresent(data, "status", enumValue(body, "status", concernStatuses));
  setIfPresent(data, "resolution", text(body, "resolution", { max: 1000 }));
  if (data.status === "RESOLVED" || data.status === "CLOSED") {
    // A concern already resolved may be formally closed without forcing the
    // operator to retype its existing resolution. A direct resolve/close still
    // requires an explicit explanation in this mutation.
    const effectiveResolution = data.resolution ?? existing?.resolution ?? null;
    if (!effectiveResolution) throw new OperationsValidationError("A resolution is required before closing a concern.");
    data.handledById = authorization.user.id;
    data.handledAt = new Date();
  }
  if (Object.keys(data).length === 0) {
    throw new OperationsValidationError("No permitted concern fields were supplied.");
  }
  return data;
}

export const operationalRequestInclude = {
  school: { select: { id: true, name: true } },
  branch: { select: { id: true, name: true, code: true } },
  requestedBy: { select: { id: true, username: true, email: true } },
  assignedTo: { select: { id: true, username: true, email: true } },
  approvedBy: { select: { id: true, username: true, email: true } },
};

export const schoolConcernInclude = {
  student: { select: { id: true, firstName: true, middleName: true, lastName: true, admissionNumber: true } },
  class: { select: { id: true, name: true, section: true, academicYear: true } },
  branch: { select: { id: true, name: true, code: true } },
  school: { select: { id: true, name: true } },
  handledBy: { select: { id: true, username: true, email: true } },
};

export function operationsError(error, fallback) {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 401 });
  }
  if (error instanceof OperationsValidationError || error?.name === "OperationsValidationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  if (error && typeof error === "object" && error.code === "P2025") {
    return NextResponse.json({ error: "The requested record was not found." }, { status: 404 });
  }
  if (error && typeof error === "object" && error.code === "P2003") {
    return NextResponse.json({ error: "That change is blocked by a related record." }, { status: 409 });
  }
  console.error("[School operations]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}
