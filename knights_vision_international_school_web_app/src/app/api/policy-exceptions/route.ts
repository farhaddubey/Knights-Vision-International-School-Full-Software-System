import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { appendEnterpriseAuditEvent } from "@/src/lib/audit/enterpriseAudit";
import {
  assertCanSubmitPolicyException,
  canReadAllPolicyExceptions,
  policyExceptionAuthorization,
  policyExceptionError,
  policyExceptionInclude,
  policyExceptionScopeWhere,
  resolvePolicyExceptionSubmission,
} from "@/src/lib/approvals/policyExceptions";

export const dynamic = "force-dynamic";

function positivePage(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  try {
    const authorization = await policyExceptionAuthorization(request);
    const query = new URL(request.url).searchParams;
    const page = positivePage(query.get("page"), 1);
    const pageSize = Math.min(positivePage(query.get("pageSize"), 20), 100);
    const status = query.get("status")?.trim().toUpperCase();
    const category = query.get("category")?.trim().toUpperCase();
    const where = {
      ...policyExceptionScopeWhere(authorization, !canReadAllPolicyExceptions(authorization)),
      ...(status ? { status: status as never } : {}),
      ...(category ? { category: category as never } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.policyException.findMany({
        where,
        include: policyExceptionInclude,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.policyException.count({ where }),
    ]);
    return NextResponse.json({ success: true, data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return policyExceptionError(error, "Unable to load policy exceptions.");
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await policyExceptionAuthorization(request);
    assertCanSubmitPolicyException(authorization);
    const data = await resolvePolicyExceptionSubmission(await request.json(), authorization);
    const record = await prisma.$transaction(async (tx) => {
      const created = await tx.policyException.create({ data, include: policyExceptionInclude });
      await tx.policyExceptionEvent.create({
        data: {
          policyExceptionId: created.id,
          actorUserId: authorization.user.id,
          action: "policy_exception.submit",
          toStatus: "SUBMITTED",
          note: data.reason,
          metadata: { category: data.category, routedRoleCode: data.routedRoleCode },
        },
      });
      return created;
    });
    await appendEnterpriseAuditEvent({
      actorUserId: authorization.user.id,
      action: "policy_exception.submit",
      resource: "PolicyException",
      resourceId: record.publicId,
      scope: { scopeType: record.classId ? "CLASS" : record.branchId ? "BRANCH" : "SCHOOL", schoolId: record.schoolId, branchId: record.branchId, classId: record.classId },
      afterData: { category: record.category, routedRoleCode: record.routedRoleCode, status: record.status },
    });
    return NextResponse.json({ success: true, data: record }, { status: 201 });
  } catch (error) {
    return policyExceptionError(error, "Unable to submit the policy exception.");
  }
}

