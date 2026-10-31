import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  applicationById,
  applicationWriteData,
  admissionTestById,
  assertScope,
  canonicalClassScope,
  errorResponse,
  feeSchemeForClass,
  requireAdmissionManage,
  routeId,
  studentById,
} from "@/src/lib/admissions/scopedAdmissions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";

async function validateLinks(authorization, data) {
  if (data.studentId) {
    const student = await studentById(data.studentId);
    if (student.schoolId !== data.schoolId || student.branchId !== data.branchId || student.classId !== data.classId) {
      throw new PanelAuthorizationError(400, "The selected student does not belong to the application's school, branch, and class.");
    }
    assertScope(authorization, student);
  }
  if (data.admissionId) {
    const test = await admissionTestById(data.admissionId);
    if (test.schoolId !== data.schoolId || test.branchId !== data.branchId || test.classId !== data.classId) {
      throw new PanelAuthorizationError(400, "The selected admission test does not belong to the application's school, branch, and class.");
    }
    assertScope(authorization, test);
  }
  if (data.feeSchemeId) await feeSchemeForClass(data.feeSchemeId, data.classId);
}

async function updateApplication(request, context) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const pathId = await routeId(context);
    const rawId = pathId || body?.id;
    const current = await applicationById(rawId);
    assertScope(authorization, current, "You cannot change an application outside your assigned scope.");

    const scopeInput = {
      classId: body?.classId ?? current.classId,
      branchId: body?.branchId ?? current.branchId,
      schoolId: body?.schoolId ?? current.schoolId,
    };
    const nextScope = await canonicalClassScope(scopeInput);
    assertScope(authorization, nextScope, "You cannot move an application outside your assigned scope.");
    const data = applicationWriteData(body || {}, nextScope);
    if (Object.keys(data).length === 0) return NextResponse.json({ error: "No supported application fields were supplied." }, { status: 400 });
    await validateLinks(authorization, { ...current, ...data, ...nextScope });

    // The panel's historical finalize flow marks the application ADMITTED in a
    // second call. The final admission number is therefore recovered from the
    // real Admission record; a browser cannot choose or overwrite it.
    if (data.status === "ADMITTED") {
      const finalizedAdmission = await prisma.admission.findUnique({
        where: { applicationId: current.id },
        select: { schoolId: true, branchId: true, classId: true, finalAdmissionNumber: true },
      });
      if (!finalizedAdmission) {
        return NextResponse.json({ error: "Create the final admission before marking this application admitted." }, { status: 409 });
      }
      assertScope(authorization, finalizedAdmission, "You cannot finalize an application outside your assigned scope.");
      data.finalAdmissionNumber = finalizedAdmission.finalAdmissionNumber;
      data.admissionConfirmedBy = String(authorization.user.id);
    }

    const application = await prisma.admissionTestApplication.update({ where: { id: current.id }, data });
    return NextResponse.json(application, { status: 200 });
  } catch (error) {
    return errorResponse(error, "Failed to update admission application.");
  }
}

export async function PUT(request, context) {
  return updateApplication(request, context);
}

export async function PATCH(request, context) {
  return updateApplication(request, context);
}

export async function DELETE(request, context) {
  try {
    const authorization = await requireAdmissionManage(request);
    const application = await applicationById(await routeId(context));
    assertScope(authorization, application, "You cannot delete an application outside your assigned scope.");
    if (application.status === "ADMITTED") {
      return NextResponse.json({ error: "An admitted application cannot be deleted." }, { status: 409 });
    }
    await prisma.admissionTestApplication.delete({ where: { id: application.id } });
    return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
  } catch (error) {
    return errorResponse(error, "Failed to delete admission application.");
  }
}
