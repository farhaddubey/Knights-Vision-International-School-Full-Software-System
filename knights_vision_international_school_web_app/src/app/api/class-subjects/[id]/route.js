import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authorizationErrorResponse, hasScopeAccess, requirePanelPermission } from "@/src/lib/rbac/authorization";

function idFromRoute(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

function inScope(authorization, record) {
  return hasScopeAccess(authorization, { schoolId: record.schoolId, branchId: record.branchId, classId: record.classId });
}

export async function GET(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.read");
    const { id } = await context.params;
    const recordId = idFromRoute(id);
    if (!recordId) return NextResponse.json({ error: "Invalid class-subject ID." }, { status: 400 });
    const record = await prisma.classSubject.findUnique({
      where: { id: recordId },
      include: { class: { select: { name: true, section: true } }, subject: { select: { name: true } }, teacher: { select: { id: true, username: true } }, school: { select: { name: true } }, branch: { select: { name: true } } },
    });
    if (!record) return NextResponse.json({ error: "Class subject not found." }, { status: 404 });
    if (!inScope(authorization, record)) return NextResponse.json({ error: "Class subject is outside your assigned scope." }, { status: 403 });
    return NextResponse.json(record);
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

export async function PUT(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.manage");
    const { id } = await context.params;
    const recordId = idFromRoute(id);
    if (!recordId) return NextResponse.json({ error: "Invalid class-subject ID." }, { status: 400 });
    const current = await prisma.classSubject.findUnique({ where: { id: recordId } });
    if (!current) return NextResponse.json({ error: "Class subject not found." }, { status: 404 });
    if (!inScope(authorization, current)) return NextResponse.json({ error: "Class subject is outside your assigned scope." }, { status: 403 });
    const body = await request.json();
    const target = { schoolId: Number(body.schoolId), branchId: Number(body.branchId), classId: Number(body.classId) };
    if (!target.schoolId || !target.branchId || !target.classId || !Number(body.subjectId) || !Number(body.teacherId)) {
      return NextResponse.json({ error: "School, branch, class, subject, and teacher are required." }, { status: 400 });
    }
    if (!hasScopeAccess(authorization, target)) return NextResponse.json({ error: "The new class-subject scope is not assigned to you." }, { status: 403 });
    const saved = await prisma.classSubject.update({ where: { id: recordId }, data: { ...target, subjectId: Number(body.subjectId), teacherId: Number(body.teacherId), syllabus: body.syllabus || { activities: [] } } });
    return NextResponse.json(saved);
  } catch (error) {
    if (error?.code === "P2002") return NextResponse.json({ error: "Class-subject combination already exists." }, { status: 400 });
    return authorizationErrorResponse(error);
  }
}

export async function DELETE(request, context) {
  try {
    const authorization = await requirePanelPermission(request, "class.manage");
    const { id } = await context.params;
    const recordId = idFromRoute(id);
    if (!recordId) return NextResponse.json({ error: "Invalid class-subject ID." }, { status: 400 });
    const current = await prisma.classSubject.findUnique({ where: { id: recordId } });
    if (!current) return NextResponse.json({ error: "Class subject not found." }, { status: 404 });
    if (!inScope(authorization, current)) return NextResponse.json({ error: "Class subject is outside your assigned scope." }, { status: 403 });
    await prisma.classSubject.delete({ where: { id: recordId } });
    return NextResponse.json({ message: "Class subject deleted successfully." });
  } catch (error) {
    return authorizationErrorResponse(error);
  }
}

