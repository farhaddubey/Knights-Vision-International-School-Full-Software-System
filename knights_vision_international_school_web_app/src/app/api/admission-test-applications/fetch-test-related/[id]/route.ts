import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  applicationById,
  assertScope,
  errorResponse,
  readNumber,
  requireAdmissionManage,
  routeId,
} from "@/src/lib/admissions/scopedAdmissions";

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const authorization = await requireAdmissionManage(request);
    const application = await applicationById(await routeId(context));
    assertScope(authorization, application, "You cannot evaluate an application outside your assigned scope.");
    const body = await request.json();
    if (typeof body?.qualified !== "boolean") return NextResponse.json({ error: "qualified must be true or false." }, { status: 400 });
    const totalMarks = readNumber(body.totalMarks, "totalMarks", { required: true, min: 0 });
    const updated = await prisma.admissionTestApplication.update({
      where: { id: application.id },
      data: { totalMarks, qualified: body.qualified, status: body.qualified ? "QUALIFIED" : "NOT_QUALIFIED" },
    });
    return NextResponse.json(updated);
  } catch (error) {
    return errorResponse(error, "Failed to update admission-test marks.");
  }
}
