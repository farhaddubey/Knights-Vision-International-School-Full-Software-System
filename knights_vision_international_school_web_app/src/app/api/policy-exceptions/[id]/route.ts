import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  assertPolicyExceptionScope,
  canReadAllPolicyExceptions,
  policyExceptionAuthorization,
  policyExceptionError,
  policyExceptionInclude,
  writePolicyExceptionTransition,
} from "@/src/lib/approvals/policyExceptions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

function routeId(value: string) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) throw new PanelAuthorizationError(400, "A valid policy exception ID is required.");
  return parsed;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await policyExceptionAuthorization(request);
    const { id } = await context.params;
    const record = await prisma.policyException.findUnique({ where: { id: routeId(id) }, include: policyExceptionInclude });
    if (!record) return NextResponse.json({ success: false, message: "Policy exception not found." }, { status: 404 });
    assertPolicyExceptionScope(authorization, record);
    if (!canReadAllPolicyExceptions(authorization) && record.requestedById !== authorization.user.id) {
      return NextResponse.json({ success: false, message: "You may only view your own submitted policy exceptions." }, { status: 403 });
    }
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return policyExceptionError(error, "Unable to load the policy exception.");
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await policyExceptionAuthorization(request);
    const { id } = await context.params;
    const record = await writePolicyExceptionTransition(routeId(id), await request.json(), authorization);
    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return policyExceptionError(error, "Unable to update the policy exception.");
  }
}
