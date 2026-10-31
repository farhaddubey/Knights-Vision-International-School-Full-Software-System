import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  admissionTestWriteData,
  assertScope,
  canonicalClassScope,
  errorResponse,
  pagination,
  requireAdmissionManage,
  requireAdmissionRead,
  scopeWhere,
} from "@/src/lib/admissions/scopedAdmissions";

export async function GET(request: Request) {
  try {
    const authorization = await requireAdmissionRead(request);
    const { searchParams } = new URL(request.url);
    const { page, pageSize, skip } = pagination(searchParams);
    const where = scopeWhere(authorization);
    const [tests, total] = await Promise.all([
      prisma.admissionTest.findMany({
        where,
        skip,
        take: pageSize,
        include: { class: { select: { name: true, section: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.admissionTest.count({ where }),
    ]);
    return NextResponse.json({ tests, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentPage: page, total });
  } catch (error) {
    return errorResponse(error, "Failed to fetch admission tests.");
  }
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const tests = Array.isArray(body) ? body : [body];
    if (!tests.length) return NextResponse.json({ error: "At least one admission test is required." }, { status: 400 });

    const created = await prisma.$transaction(async (tx) => {
      const result = [];
      for (const input of tests) {
        const scope = await canonicalClassScope(input);
        assertScope(authorization, scope);
        result.push(await tx.admissionTest.create({ data: admissionTestWriteData(input, scope, { creating: true }) }));
      }
      return result;
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to create admission test.");
  }
}
