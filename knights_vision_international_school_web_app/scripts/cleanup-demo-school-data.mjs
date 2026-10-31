/*
 * Removes only records proven to be local training/demo data.  It intentionally
 * preserves the imported Firebase students, the School/Branch/Class structure,
 * subjects, and fee-scheme rows.
 *
 * Safe default: report only.  Run with --apply only after reviewing the report.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const APPLY = process.argv.includes('--apply');

const DEMO_EMAIL_DOMAIN = '@ssps.invalid';
// SSPS-TRAINING was created solely for the earlier preview/seed exercise.  At
// cleanup time it contains only seeded or manually entered test students; the
// imported Firebase cohort lives in SSPS-MAIN and is never selected here.
const trainingBranchStudentWhere = { branch: { code: 'SSPS-TRAINING' } };
const demoStudentWhere = {
  OR: [
    { admissionNumber: { startsWith: 'DEMO-SSPS-' } },
    { enrollmentMode: 'SYSTEM_SEED_DEMO' },
    trainingBranchStudentWhere,
  ],
};
const demoUserWhere = { email: { endsWith: DEMO_EMAIL_DOMAIN } };

const idsWhere = (ids) => ({ in: ids });
const nonEmpty = (ids) => Array.isArray(ids) && ids.length > 0;

async function loadScope(client) {
  const [students, users] = await Promise.all([
    client.student.findMany({
      where: demoStudentWhere,
      select: { id: true, admissionNumber: true, enrollmentMode: true, branchId: true },
      orderBy: { id: 'asc' },
    }),
    client.user.findMany({
      where: demoUserWhere,
      select: { id: true, email: true, username: true },
      orderBy: { id: 'asc' },
    }),
  ]);
  return { students, users, studentIds: students.map((student) => student.id), userIds: users.map((user) => user.id) };
}

async function countScope(client, scope) {
  const { studentIds, userIds } = scope;
  if (!nonEmpty(studentIds) && !nonEmpty(userIds)) return {};
  const student = nonEmpty(studentIds) ? idsWhere(studentIds) : undefined;
  const user = nonEmpty(userIds) ? idsWhere(userIds) : undefined;
  const when = async (label, operation) => {
    const count = await operation();
    return count ? [label, count] : null;
  };

  const records = await Promise.all([
    student && when('students', () => client.student.count({ where: { id: student } })),
    student && when('admissions', () => client.admission.count({ where: { studentId: student } })),
    student && when('admission fee transactions', () => client.admissionFeeTransaction.count({ where: { studentId: student } })),
    student && when('monthly-fee rows', () => client.monthlyFee.count({ where: { studentId: student } })),
    student && when('monthly-fee payments', () => client.monthlyFeePayment.count({ where: { monthlyFee: { studentId: student } } })),
    student && when('provisional fee collections', () => client.provisionalFeeCollection.count({ where: { OR: [{ monthlyFee: { studentId: student } }, { admission: { studentId: student } }] } })),
    student && when('attendance rows', () => client.attendance.count({ where: { studentId: student } })),
    student && when('test marks', () => client.testMark.count({ where: { studentId: student } })),
    student && when('semester results', () => client.semesterResult.count({ where: { studentId: student } })),
    student && when('homework records', () => client.dailyHomeworkCompletion.count({ where: { studentId: student } })),
    student && when('student assignments', () => client.studentAssignment.count({ where: { studentId: student } })),
    student && when('guardian communications', () => client.guardianCommunicationLog.count({ where: { studentId: student } })),
    student && when('guardian calls', () => client.guardianCallLog.count({ where: { studentId: student } })),
    student && when('PTM notes', () => client.parentTeacherMeetingNote.count({ where: { studentId: student } })),
    student && when('behaviour logs', () => client.studentBehaviourLog.count({ where: { studentId: student } })),
    user && when('demo users', () => client.user.count({ where: { id: user } })),
    user && when('staff attendance rows', () => client.employee_attendance_logs.count({ where: { user_id: user } })),
    user && when('staff salary rows', () => client.employee_salaries.count({ where: { user_id: user } })),
    user && when('RBAC audit rows', () => client.accessAuditLog.count({ where: { OR: [{ actorUserId: user }, { targetUserId: user }] } })),
    when('training assignments', () => client.assignment.count({ where: { title: { startsWith: 'Training ' } } })),
    when('training tests', () => client.test.count({ where: { title: { startsWith: 'Training ' } } })),
    when('training syllabus topics', () => client.subjectSyllabus.count({ where: { topic: { startsWith: 'Training ' } } })),
    when('seeded class instructions', () => client.classLifeSystemInstruction.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } })),
    when('seeded food instructions', () => client.classFoodInstruction.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } })),
    when('seeded CDTP sessions', () => client.knightsCdtpSession.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } })),
    when('seeded speaking occasions', () => client.publicSpeakingOccasion.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } })),
  ]);
  return Object.fromEntries(records.filter(Boolean));
}

async function deleteDemoData(tx, scope) {
  const { studentIds, userIds } = scope;
  if (!nonEmpty(studentIds) && !nonEmpty(userIds)) return {};
  const student = nonEmpty(studentIds) ? idsWhere(studentIds) : undefined;
  const user = nonEmpty(userIds) ? idsWhere(userIds) : undefined;
  const deleted = {};
  const remove = async (label, action) => {
    const { count } = await action();
    if (count) deleted[label] = count;
  };

  // Dependent payment and student records must be removed before Admission and Student.
  if (student) {
    await remove('provisional fee collections', () => tx.provisionalFeeCollection.deleteMany({ where: { OR: [{ monthlyFee: { studentId: student } }, { admission: { studentId: student } }] } }));
    await remove('monthly-fee payments', () => tx.monthlyFeePayment.deleteMany({ where: { monthlyFee: { studentId: student } } }));
    await remove('admission fee transactions', () => tx.admissionFeeTransaction.deleteMany({ where: { studentId: student } }));
    await remove('TC feedback', () => tx.transferCertificateFeedback.deleteMany({ where: { request: { studentId: student } } }));
    await remove('TC requests', () => tx.transferCertificateRequest.deleteMany({ where: { studentId: student } }));
    await remove('student enrollments', () => tx.studentEnrollment.deleteMany({ where: { studentId: student } }));
    await remove('monthly-fee rows', () => tx.monthlyFee.deleteMany({ where: { studentId: student } }));
    await remove('board-exam results', () => tx.boardExamResult.deleteMany({ where: { studentId: student } }));
    await remove('test marks', () => tx.testMark.deleteMany({ where: { studentId: student } }));
    await remove('student assignments', () => tx.studentAssignment.deleteMany({ where: { studentId: student } }));
    await remove('daily homework records', () => tx.dailyHomeworkCompletion.deleteMany({ where: { studentId: student } }));
    await remove('student homework reviews', () => tx.studentHomeworkReview.deleteMany({ where: { studentId: student } }));
    await remove('semester results', () => tx.semesterResult.deleteMany({ where: { studentId: student } }));
    await remove('legacy fee rows', () => tx.fee.deleteMany({ where: { studentId: student } }));
    await remove('guardian communications', () => tx.guardianCommunicationLog.deleteMany({ where: { studentId: student } }));
    await remove('guardian calls', () => tx.guardianCallLog.deleteMany({ where: { studentId: student } }));
    await remove('PTM notes', () => tx.parentTeacherMeetingNote.deleteMany({ where: { studentId: student } }));
    await remove('guardian special notes', () => tx.guardianStudentSpecialNote.deleteMany({ where: { studentId: student } }));
    await remove('behaviour logs', () => tx.studentBehaviourLog.deleteMany({ where: { studentId: student } }));
    await remove('improvement suggestions', () => tx.improvementSuggestion.deleteMany({ where: { studentId: student } }));
    await remove('public speech submissions', () => tx.publicSpeechSubmission.deleteMany({ where: { studentId: student } }));
    await remove('prayer/oath assignments', () => tx.prayerOathAssignment.deleteMany({ where: { studentId: student } }));
    await remove('leave requests', () => tx.leaveRequest.deleteMany({ where: { studentId: student } }));
    await remove('school concerns', () => tx.schoolConcern.deleteMany({ where: { studentId: student } }));
    await remove('attendance rows', () => tx.attendance.deleteMany({ where: { studentId: student } }));
    await remove('admissions', () => tx.admission.deleteMany({ where: { studentId: student } }));
    await remove('students', () => tx.student.deleteMany({ where: { id: student } }));
  }

  // Remove class-level records with the explicit seed markers, but retain class,
  // room, subject, and class-subject structures for future real operations.
  await remove('training daily plans', () => tx.syllabusScheduleDailyPlan.deleteMany({ where: { topicTitle: { startsWith: 'Training ' } } }));
  await remove('training syllabus topics', () => tx.subjectSyllabus.deleteMany({ where: { topic: { startsWith: 'Training ' } } }));
  await remove('training assignments', () => tx.assignment.deleteMany({ where: { title: { startsWith: 'Training ' } } }));
  await remove('training tests', () => tx.test.deleteMany({ where: { title: { startsWith: 'Training ' } } }));
  await remove('seeded class instructions', () => tx.classLifeSystemInstruction.deleteMany({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }));
  await remove('seeded food instructions', () => tx.classFoodInstruction.deleteMany({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }));
  await remove('seeded CDTP sessions', () => tx.knightsCdtpSession.deleteMany({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }));
  await remove('seeded speaking occasions', () => tx.publicSpeakingOccasion.deleteMany({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }));

  if (user) {
    // These are the isolated staff/HQ demo identities only.  Real executive
    // accounts are never selected because their e-mail addresses are not .invalid.
    await remove('salary payment logs', () => tx.salary_paid_logs.deleteMany({ where: { OR: [{ user_id: user }, { paid_by_user_id: user }] } }));
    await remove('staff salary rows', () => tx.employee_salaries.deleteMany({ where: { user_id: user } }));
    await remove('staff attendance rows', () => tx.employee_attendance_logs.deleteMany({ where: { user_id: user } }));
    await remove('branch role assignments', () => tx.branchRoleAssignment.deleteMany({ where: { userId: user } }));
    await remove('teacher-subject assignments', () => tx.teacherSubjectAssignment.deleteMany({ where: { OR: [{ teacherId: user }, { assignedById: user }] } }));
    await remove('duty assignments', () => tx.dutyAssignment.deleteMany({ where: { userId: user } }));
    await remove('demo media submissions', () => tx.schoolMediaEvidence.deleteMany({ where: { submittedById: user } }));
    await remove('RBAC audit rows', () => tx.accessAuditLog.deleteMany({ where: { OR: [{ actorUserId: user }, { targetUserId: user }] } }));
    await remove('demo users', () => tx.user.deleteMany({ where: { id: user } }));
  }
  return deleted;
}

async function main() {
  const beforeScope = await loadScope(prisma);
  const before = await countScope(prisma, beforeScope);
  const report = {
    mode: APPLY ? 'apply' : 'check',
    target: {
      students: beforeScope.students,
      users: beforeScope.users,
      preserved: 'All Firebase-imported students, School/Branch/Class records, subjects, class-subject mappings, rooms, and FeeScheme rows.',
    },
    before,
  };

  if (!APPLY) {
    console.log(JSON.stringify(report, null, 2));
    return;
  }

  const deleted = await prisma.$transaction((tx) => deleteDemoData(tx, beforeScope), { maxWait: 10_000, timeout: 60_000 });
  const afterScope = await loadScope(prisma);
  const after = await countScope(prisma, afterScope);
  console.log(JSON.stringify({ ...report, deleted, after }, null, 2));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
