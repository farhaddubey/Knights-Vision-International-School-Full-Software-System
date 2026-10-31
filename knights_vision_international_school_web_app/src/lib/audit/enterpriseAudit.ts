import { randomUUID } from "crypto";
import prisma from "@/lib/prisma";
import type { ScopeAssignment, ScopeType } from "../rbac/policy";

type AuditOutcome = "SUCCESS" | "DENIED" | "FAILED";

export type EnterpriseAuditInput = {
  actorUserId?: number | null;
  action: string;
  resource: string;
  resourceId?: string | number | null;
  outcome?: AuditOutcome;
  correlationId?: string | null;
  scope?: Partial<ScopeAssignment> | null;
  beforeData?: unknown;
  afterData?: unknown;
  metadata?: unknown;
};

const sensitiveKey = /(password|token|secret|otp|aadhar|aadhaar|uid)/i;

function sanitize(value: unknown, depth = 0): unknown {
  if (depth > 8 || value === null || value === undefined) return value ?? null;
  if (Array.isArray(value)) return value.map((item) => sanitize(item, depth + 1));
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, nestedValue]) => [
      key,
      sensitiveKey.test(key) ? "[REDACTED]" : sanitize(nestedValue, depth + 1),
    ]),
  );
}

function normalizeScope(scope?: Partial<ScopeAssignment> | null) {
  const scopeType = scope?.scopeType as ScopeType | undefined;
  return {
    scopeType: scopeType ?? null,
    schoolId: scope?.schoolId ?? null,
    branchId: scope?.branchId ?? null,
    classId: scope?.classId ?? null,
  };
}

/**
 * Records structured, secret-safe evidence for new enterprise operations.
 * Legacy APIs continue to write AccessAuditLog until they are migrated.
 */
export async function appendEnterpriseAuditEvent(input: EnterpriseAuditInput) {
  const scope = normalizeScope(input.scope);

  return prisma.enterpriseAuditEvent.create({
    data: {
      publicId: randomUUID(),
      actorUserId: input.actorUserId ?? null,
      action: input.action.slice(0, 150),
      resource: input.resource.slice(0, 100),
      resourceId: input.resourceId == null ? null : String(input.resourceId).slice(0, 100),
      outcome: input.outcome ?? "SUCCESS",
      correlationId: input.correlationId?.slice(0, 100) ?? null,
      scopeType: scope.scopeType,
      schoolId: scope.schoolId,
      branchId: scope.branchId,
      classId: scope.classId,
      beforeData: sanitize(input.beforeData) as object | undefined,
      afterData: sanitize(input.afterData) as object | undefined,
      metadata: sanitize(input.metadata) as object | undefined,
    },
  });
}
