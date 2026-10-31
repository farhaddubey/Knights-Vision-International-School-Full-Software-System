import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  admissionTestById,
  admissionTestWriteData,
  assertScope,
  canonicalClassScope,
  errorResponse,
  requireAdmissionManage,
  routeId,
} from "@/src/lib/admissions/scopedAdmissions";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await requireAdmissionManage(request);
    const current = await admissionTestById(await routeId(context));
    assertScope(authorization, current, "You cannot change an admission test outside your assigned scope.");
    const body = await request.json();
    const nextScope = await canonicalClassScope({
      classId: body?.classId ?? current.classId,
      branchId: body?.branchId ?? current.branchId,
      schoolId: body?.schoolId ?? current.schoolId,
    });
    assertScope(authorization, nextScope, "You cannot move an admission test outside your assigned scope.");
    const data = admissionTestWriteData(body || {}, nextScope);
    if (!Object.keys(data).length) return NextResponse.json({ error: "No supported admission-test fields were supplied." }, { status: 400 });
    const test = await prisma.admissionTest.update({ where: { id: current.id }, data });
    return NextResponse.json(test);
  } catch (error) {
    return errorResponse(error, "Failed to update admission test.");
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await requireAdmissionManage(request);
    const test = await admissionTestById(await routeId(context));
    assertScope(authorization, test, "You cannot delete an admission test outside your assigned scope.");
    const linkedApplicationCount = await prisma.admissionTestApplication.count({ where: { admissionId: test.id } });
    if (linkedApplicationCount) {
      return NextResponse.json({ error: "An admission test with applications cannot be deleted." }, { status: 409 });
    }
    await prisma.admissionTest.delete({ where: { id: test.id } });
    return NextResponse.json({ message: "Admission test deleted successfully" });
  } catch (error) {
    return errorResponse(error, "Failed to delete admission test.");
  }
}
