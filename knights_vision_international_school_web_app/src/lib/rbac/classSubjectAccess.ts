import prisma from "@/lib/prisma";
import {
  hasPermission,
  hasScopeAccess,
  PanelAuthorizationError,
  requirePanelPermission,
  type PanelAuthorization,
} from "./authorization";

const classSubjectScopeInclude = {
  class: {
    select: {
      id: true,
      schoolId: true,
      branchId: true,
      academicYear: true,
      classTeacherId: true,
    },
  },
} as const;

// These roles are responsible for examination operations inside their assigned
// school or branch. Subject and class teachers remain limited to their own
// teaching assignment unless they are also assigned one of these roles.
const examinationSupervisorRoles = new Set([
  "SYSTEM_ADMIN",
  "PRINCIPAL",
  "ACADEMIC_COORDINATOR",
  "AIC",
  "COEF",
  "EXAM_CONTROLLER",
]);

export function positiveInteger(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function classScope(classSubject: Awaited<ReturnType<typeof loadClassSubject>>) {
  return {
    schoolId: classSubject.class.schoolId,
    branchId: classSubject.class.branchId,
    classId: classSubject.class.id,
  };
}

async function loadClassSubject(classSubjectId: number) {
  return prisma.classSubject.findUnique({
    where: { id: classSubjectId },
    include: classSubjectScopeInclude,
  });
}

function hasExaminationSupervision(authorization: PanelAuthorization) {
  return hasPermission(authorization, "class.manage")
    || authorization.roles.some((role) => examinationSupervisorRoles.has(role.code));
}

/**
 * Checks an already-resolved class subject. The route must resolve the resource
 * from the database first; browser-supplied school, branch, or class IDs are
 * never used as authorization evidence.
 */
export function assertClassSubjectWriteAccess(
  authorization: PanelAuthorization,
  classSubject: NonNullable<Awaited<ReturnType<typeof loadClassSubject>>>,
  options: { operation: "homework" | "exam" },
) {
  const scope = classScope(classSubject);
  if (!hasScopeAccess(authorization, scope)) {
    throw new PanelAuthorizationError(403, "You do not have access to this class subject.");
  }

  const mayManageEverySubject = options.operation === "exam"
    ? hasExaminationSupervision(authorization)
    : hasPermission(authorization, "class.manage");

  if (
    !mayManageEverySubject
    && classSubject.teacherId !== authorization.user.id
    && classSubject.class.classTeacherId !== authorization.user.id
  ) {
    throw new PanelAuthorizationError(
      403,
      "You can manage this work only for your assigned subject or class.",
    );
  }

  return scope;
}

export async function requireClassSubjectWriteAccess(
  request: Request,
  permission: string,
  classSubjectId: unknown,
  options: { operation: "homework" | "exam" },
) {
  const authorization = await requirePanelPermission(request, permission);
  const numericClassSubjectId = positiveInteger(classSubjectId);
  if (!numericClassSubjectId) {
    throw new PanelAuthorizationError(400, "A valid class subject is required.");
  }

  const classSubject = await loadClassSubject(numericClassSubjectId);
  if (!classSubject) {
    throw new PanelAuthorizationError(404, "Class subject not found.");
  }

  const scope = assertClassSubjectWriteAccess(authorization, classSubject, options);
  return { authorization, classSubject, scope };
}

export async function requireClassSubjectAccess(
  request: Request,
  permission: string,
  classSubjectId: unknown,
) {
  const authorization = await requirePanelPermission(request, permission);
  const numericClassSubjectId = positiveInteger(classSubjectId);
  if (!numericClassSubjectId) {
    throw new PanelAuthorizationError(400, "A valid class subject is required.");
  }

  const classSubject = await loadClassSubject(numericClassSubjectId);
  if (!classSubject) {
    throw new PanelAuthorizationError(404, "Class subject not found.");
  }

  const scope = classScope(classSubject);
  if (!hasScopeAccess(authorization, scope)) {
    throw new PanelAuthorizationError(403, "You do not have access to this class subject.");
  }

  return { authorization, classSubject, scope };
}

export async function requireClassAccess(request: Request, permission: string, classId: unknown) {
  const authorization = await requirePanelPermission(request, permission);
  const numericClassId = positiveInteger(classId);
  if (!numericClassId) {
    throw new PanelAuthorizationError(400, "A valid class is required.");
  }

  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: numericClassId },
    select: { id: true, schoolId: true, branchId: true, academicYear: true, classTeacherId: true },
  });
  if (!schoolClass) {
    throw new PanelAuthorizationError(404, "Class not found.");
  }

  const scope = { schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, classId: schoolClass.id };
  if (!hasScopeAccess(authorization, scope)) {
    throw new PanelAuthorizationError(403, "You do not have access to this class.");
  }

  return { authorization, schoolClass, scope };
}

export async function requireClassSubjectBatchWriteAccess(
  request: Request,
  permission: string,
  classSubjectIds: unknown[],
  options: { operation: "homework" | "exam" },
) {
  const authorization = await requirePanelPermission(request, permission);
  const normalizedIds = [...new Set(classSubjectIds.map(positiveInteger))];
  if (normalizedIds.length === 0 || normalizedIds.some((id) => id === null)) {
    throw new PanelAuthorizationError(400, "Each item must include a valid class subject.");
  }

  const ids = normalizedIds as number[];
  const classSubjects = await prisma.classSubject.findMany({
    where: { id: { in: ids } },
    include: classSubjectScopeInclude,
  });
  if (classSubjects.length !== ids.length) {
    throw new PanelAuthorizationError(404, "One or more class subjects were not found.");
  }

  const classSubjectsById = new Map<number, (typeof classSubjects)[number]>(
    classSubjects.map((classSubject) => [classSubject.id, classSubject] as const),
  );
  for (const classSubjectId of ids) {
    const classSubject = classSubjectsById.get(classSubjectId);
    if (!classSubject) {
      throw new PanelAuthorizationError(404, "Class subject not found.");
    }
    assertClassSubjectWriteAccess(authorization, classSubject, options);
  }

  return { authorization, classSubjects, classSubjectsById };
}

export async function requireTestWriteAccess(request: Request, testId: unknown) {
  const authorization = await requirePanelPermission(request, "exam.manage");
  const numericTestId = positiveInteger(testId);
  if (!numericTestId) {
    throw new PanelAuthorizationError(400, "A valid test is required.");
  }

  const test = await prisma.test.findUnique({
    where: { id: numericTestId },
    include: { classSubject: { include: classSubjectScopeInclude } },
  });
  if (!test) {
    throw new PanelAuthorizationError(404, "Test not found.");
  }

  const scope = assertClassSubjectWriteAccess(authorization, test.classSubject, { operation: "exam" });
  return { authorization, test, scope };
}

export async function requireBoardExamWriteAccess(request: Request, boardExamId: unknown) {
  const authorization = await requirePanelPermission(request, "exam.manage");
  const numericBoardExamId = positiveInteger(boardExamId);
  if (!numericBoardExamId) {
    throw new PanelAuthorizationError(400, "A valid board exam is required.");
  }

  const boardExam = await prisma.boardExam.findUnique({
    where: { id: numericBoardExamId },
    include: { classSubject: { include: classSubjectScopeInclude } },
  });
  if (!boardExam) {
    throw new PanelAuthorizationError(404, "Board exam not found.");
  }

  const scope = assertClassSubjectWriteAccess(authorization, boardExam.classSubject, { operation: "exam" });
  return { authorization, boardExam, scope };
}
