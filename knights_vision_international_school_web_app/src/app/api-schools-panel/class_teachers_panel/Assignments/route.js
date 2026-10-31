import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function validDate(value) {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function POST(request) {
  try {
    const authorization = await requirePanelPermission(request, "homework.manage");
    const body = await request.json();
    const classSubjectId = positiveInteger(body.classSubjectId);
    const dueDate = validDate(body.dueDate);
    const biWeeklySlotStart = validDate(body.biWeeklySlotStart);
    const biWeeklySlotEnd = validDate(body.biWeeklySlotEnd);

    if (!classSubjectId || !body.title || !body.description || !dueDate || !biWeeklySlotStart || !biWeeklySlotEnd) {
      return NextResponse.json({ error: "A class subject, title, description, due date, and valid bi-weekly dates are required." }, { status: 400 });
    }
    if (biWeeklySlotEnd < biWeeklySlotStart) {
      return NextResponse.json({ error: "The bi-weekly end date must be after the start date." }, { status: 400 });
    }

    const classSubject = await prisma.classSubject.findUnique({
      where: { id: classSubjectId },
      include: {
        class: { select: { id: true, schoolId: true, branchId: true, classTeacherId: true } },
      },
    });
    const classScope = classSubject
      ? { schoolId: classSubject.class.schoolId, branchId: classSubject.class.branchId, classId: classSubject.class.id }
      : null;
    if (!classSubject || !classScope || !hasScopeAccess(authorization, classScope)) {
      return NextResponse.json({ error: "You do not have access to this class subject." }, { status: 403 });
    }
    if (!authorization.permissions.includes("class.manage")
      && classSubject.teacherId !== authorization.user.id
      && classSubject.class.classTeacherId !== authorization.user.id) {
      return NextResponse.json({ error: "You can create homework only for your assigned subject or class." }, { status: 403 });
    }

    const assignment = await prisma.assignment.create({
      data: {
        classSubjectId,
        title: String(body.title).trim(),
        description: String(body.description).trim(),
        dueDate,
        biWeeklySlotStart,
        biWeeklySlotEnd,
        marks: body.marks ?? undefined,
      },
    });

    return NextResponse.json(assignment, { status: 201 });
  } catch (error) {
    if (error instanceof PanelAuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("POST assignment failed:", error);
    return NextResponse.json({ error: "Unable to create assignment." }, { status: 500 });
  }
}
