import prisma from "@/lib/prisma";

export class DailySyllabusScopeError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "DailySyllabusScopeError";
    this.status = status;
  }
}

function positiveInteger(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function serialiseSchedule(schedule) {
  const { branchCompletions, ...plan } = schedule;
  const completion = branchCompletions?.[0] || null;

  return {
    ...plan,
    // These two legacy fields remain in the response shape, but now describe
    // only the current school/branch delivery record.
    isCompleted: Boolean(completion),
    completionDate: completion?.completedAt ? completion.completedAt.toISOString() : null,
    date: plan.date.toISOString(),
    homeworkDueDate: plan.homeworkDueDate ? plan.homeworkDueDate.toISOString() : null,
    branchCompletion: completion
      ? {
          id: completion.id,
          completedAt: completion.completedAt.toISOString(),
          completedById: completion.completedById,
        }
      : null,
  };
}

export async function getClassSubjectInBranch(classSubjectId, scope) {
  const id = positiveInteger(classSubjectId);
  if (!id) throw new DailySyllabusScopeError(400, "A valid class subject is required.");

  const classSubject = await getClassSubjectScope(id);
  if (
    classSubject.classId !== scope.classId
    || classSubject.schoolId !== scope.schoolId
    || classSubject.branchId !== scope.branchId
  ) {
    throw new DailySyllabusScopeError(404, "No syllabus exists for this class subject in your school branch.");
  }
  return classSubject;
}

export async function getClassSubjectScope(classSubjectId) {
  const id = positiveInteger(classSubjectId);
  if (!id) throw new DailySyllabusScopeError(400, "A valid class subject is required.");

  const classSubject = await prisma.classSubject.findUnique({
    where: { id },
    select: {
      id: true,
      classId: true,
      schoolId: true,
      branchId: true,
      teacherId: true,
      class: { select: { classTeacherId: true } },
    },
  });

  if (!classSubject) {
    throw new DailySyllabusScopeError(404, "Class subject not found.");
  }
  return classSubject;
}

export async function getDailyScheduleScope(scheduleId) {
  const id = positiveInteger(scheduleId);
  if (!id) throw new DailySyllabusScopeError(400, "A valid daily syllabus schedule is required.");
  const schedule = await prisma.syllabusScheduleDailyPlan.findUnique({
    where: { id },
    select: { id: true, classSubjectId: true },
  });
  if (!schedule) throw new DailySyllabusScopeError(404, "Daily syllabus schedule not found.");
  return { schedule, classSubject: await getClassSubjectScope(schedule.classSubjectId) };
}

export async function getBranchDailySchedules(classSubjectId, scope) {
  const classSubject = await getClassSubjectInBranch(classSubjectId, scope);
  const schedules = await prisma.syllabusScheduleDailyPlan.findMany({
    where: { classSubjectId: classSubject.id },
    include: {
      classSubject: { include: { subject: true } },
      subjectSyllabus: true,
      branchCompletions: {
        where: { schoolId: scope.schoolId, branchId: scope.branchId },
        select: { id: true, completedAt: true, completedById: true },
      },
    },
    orderBy: { date: "asc" },
  });

  return { classSubject, schedules: schedules.map(serialiseSchedule) };
}

export async function completeBranchDailySchedule(scheduleId, scope, completedById) {
  const id = positiveInteger(scheduleId);
  if (!id) throw new DailySyllabusScopeError(400, "A valid daily syllabus schedule is required.");

  const schedule = await prisma.syllabusScheduleDailyPlan.findFirst({
    where: {
      id,
      classSubject: {
        classId: scope.classId,
        schoolId: scope.schoolId,
        branchId: scope.branchId,
      },
    },
    select: { id: true, classSubjectId: true },
  });
  if (!schedule) {
    throw new DailySyllabusScopeError(404, "Daily syllabus schedule not found in your school branch.");
  }

  const uniqueWhere = {
    syllabusScheduleId_schoolId_branchId: {
      syllabusScheduleId: schedule.id,
      schoolId: scope.schoolId,
      branchId: scope.branchId,
    },
  };
  const existing = await prisma.syllabusScheduleBranchCompletion.findUnique({ where: uniqueWhere });
  if (existing) return { schedule, completion: existing, alreadyCompleted: true };

  try {
    const completion = await prisma.syllabusScheduleBranchCompletion.create({
      data: {
        syllabusScheduleId: schedule.id,
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        completedById: positiveInteger(completedById),
      },
    });
    return { schedule, completion, alreadyCompleted: false };
  } catch (error) {
    // The unique key makes an overlapping double-click harmless and preserves
    // the original completion time and staff member.
    if (error?.code !== "P2002") throw error;
    const completion = await prisma.syllabusScheduleBranchCompletion.findUnique({ where: uniqueWhere });
    return { schedule, completion, alreadyCompleted: true };
  }
}
