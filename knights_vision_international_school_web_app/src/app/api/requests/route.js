import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  operationalRequestInclude,
  operationalRequestWriteData,
  operationScopeWhere,
  operationsError,
  requireOperationsManage,
  requireOperationsRead,
} from "@/src/lib/operations/scopedOperations";

function pageValue(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request) {
  try {
    const authorization = await requireOperationsRead(request);
    const { searchParams } = new URL(request.url);
    const resource = searchParams.get("resource");
    if (resource === "branches") {
      const data = await prisma.schoolBranch.findMany({
        where: operationScopeWhere(authorization),
        select: { id: true, schoolId: true, name: true, code: true },
        orderBy: { name: "asc" },
        take: 500,
      });
      return NextResponse.json({ data });
    }
    const page = pageValue(searchParams.get("page"), 1);
    const pageSize = Math.min(pageValue(searchParams.get("pageSize"), 20), 100);
    const status = searchParams.get("status");
    const where = {
      ...operationScopeWhere(authorization),
      ...(status ? { status } : {}),
    };
    const [data, total] = await Promise.all([
      prisma.operationalRequest.findMany({
        where,
        include: operationalRequestInclude,
        orderBy: [{ status: "asc" }, { createdAt: "desc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.operationalRequest.count({ where }),
    ]);
    return NextResponse.json({ data, total, page, pageSize, totalPages: Math.ceil(total / pageSize) });
  } catch (error) {
    return operationsError(error, "Failed to fetch operational requests.");
  }
}

export async function POST(request) {
  try {
    const authorization = await requireOperationsManage(request);
    const data = await operationalRequestWriteData(await request.json(), authorization, { creating: true });
    const record = await prisma.operationalRequest.create({ data, include: operationalRequestInclude });
    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    return operationsError(error, "Failed to create operational request.");
  }
}
