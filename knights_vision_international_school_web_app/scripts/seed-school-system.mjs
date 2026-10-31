import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { formatStudentAdmissionNumber } from '../src/lib/students/admissionNumbers.js';

const prisma = new PrismaClient();

const APPLY = process.argv.includes('--apply');
const CHECK = process.argv.includes('--check');
const ACADEMIC_YEAR = 2026;
const STUDENTS_PER_CLASS = Math.min(Math.max(Number.parseInt(process.env.SSPS_DEMO_STUDENTS_PER_CLASS || '18', 10) || 18, 12), 30);
const SCHOOL_SLUG = 'sure-success-point-school';
const MAIN_BRANCH_CODE = 'SSPS-MAIN';
const TRAINING_BRANCH = {
  name: 'Training & Preview Branch',
  code: 'SSPS-TRAINING',
  slug: 'ssps-training-demo-2026',
  address: 'Training-only branch for panel and API verification. Not a public campus.',
};

const classNames = ['LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XS', 'XI', 'XII', 'XIIS', 'XIIIJ'];

const subjects = [
  ['english', 'English', 'Language and communication'],
  ['bengali', 'Bengali', 'First language studies'],
  ['hindi', 'Hindi', 'Second language studies'],
  ['mathematics', 'Mathematics', 'Numeracy and problem solving'],
  ['environmental-studies', 'Environmental Studies', 'Foundational environmental learning'],
  ['science', 'Science', 'Integrated science'],
  ['physical-science', 'Physical Science', 'Physics and chemistry foundations'],
  ['life-science', 'Life Science', 'Biology foundations'],
  ['social-science', 'Social Science', 'Society and citizenship'],
  ['history', 'History', 'Historical studies'],
  ['geography', 'Geography', 'Geographical studies'],
  ['computer-science', 'Computer Science', 'Digital literacy and computing'],
  ['computer-applications', 'Computer Applications', 'Applied computing'],
  ['art-craft', 'Art & Craft', 'Creative expression'],
  ['physical-education', 'Physical Education', 'Health, fitness and games'],
  ['general-knowledge', 'General Knowledge', 'General awareness'],
  ['physics', 'Physics', 'Senior secondary physics'],
  ['chemistry', 'Chemistry', 'Senior secondary chemistry'],
  ['biology', 'Biology', 'Senior secondary biology'],
];

const subjectSlugsByClass = {
  LKG: ['english', 'mathematics', 'environmental-studies', 'art-craft', 'physical-education'],
  UKG: ['english', 'mathematics', 'environmental-studies', 'art-craft', 'physical-education'],
  I: ['english', 'bengali', 'mathematics', 'environmental-studies', 'art-craft', 'physical-education'],
  II: ['english', 'bengali', 'mathematics', 'environmental-studies', 'art-craft', 'physical-education'],
  III: ['english', 'bengali', 'mathematics', 'environmental-studies', 'general-knowledge', 'physical-education'],
  IV: ['english', 'bengali', 'mathematics', 'environmental-studies', 'general-knowledge', 'physical-education'],
  V: ['english', 'bengali', 'mathematics', 'science', 'social-science', 'computer-science', 'art-craft', 'physical-education'],
  VI: ['english', 'bengali', 'hindi', 'mathematics', 'science', 'social-science', 'computer-science', 'physical-education'],
  VII: ['english', 'bengali', 'hindi', 'mathematics', 'science', 'social-science', 'computer-science', 'physical-education'],
  VIII: ['english', 'bengali', 'hindi', 'mathematics', 'science', 'social-science', 'computer-science', 'physical-education'],
  IX: ['english', 'bengali', 'mathematics', 'physical-science', 'life-science', 'history', 'geography', 'computer-applications'],
  X: ['english', 'bengali', 'mathematics', 'physical-science', 'life-science', 'history', 'geography', 'computer-applications'],
  XS: ['english', 'bengali', 'mathematics', 'physical-science', 'life-science', 'history', 'geography', 'computer-applications'],
  XI: ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer-science'],
  XII: ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer-science'],
  XIIS: ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer-science'],
  XIIIJ: ['english', 'mathematics', 'physics', 'chemistry', 'biology', 'computer-science'],
};

const staffSpecs = [
  { key: 'system', email: 'demo.system@ssps.invalid', username: 'Demo System In Charge', legacyRole: 'SYSTEM_IN_CHARGE', accessRole: 'SYSTEM_IN_CHARGE', scope: 'SCHOOL', department: 'TECHNICAL_SUPPORT' },
  { key: 'principal', email: 'demo.principal@ssps.invalid', username: 'Demo Principal', legacyRole: 'PRINCIPAL_HEAD', accessRole: 'PRINCIPAL', scope: 'SCHOOL', department: 'ADMINISTRATION' },
  { key: 'aic', email: 'demo.aic@ssps.invalid', username: 'Demo AIC', legacyRole: 'ACADEMICS_IN_CHARGE', accessRole: 'AIC', scope: 'SCHOOL', department: 'ACADEMIC' },
  { key: 'coe', email: 'demo.coe@ssps.invalid', username: 'Demo COE', legacyRole: 'HEAD_OF_DEPARTMENTS', accessRole: 'COE', scope: 'BRANCH', department: 'ADMINISTRATION' },
  { key: 'coef', email: 'demo.coef@ssps.invalid', username: 'Demo COEF', legacyRole: 'FMO', accessRole: 'COEF', scope: 'BRANCH', department: 'ADMINISTRATION' },
  { key: 'gci', email: 'demo.gci@ssps.invalid', username: 'Demo GCI', legacyRole: 'GCI', accessRole: 'GCI', scope: 'BRANCH', department: 'STUDENT_WELFARE' },
  { key: 'classTeacher', email: 'demo.teacher.primary@ssps.invalid', username: 'Demo Primary Class Teacher', legacyRole: 'TEACHER', accessRole: 'CLASS_TEACHER', scope: 'CLASS', department: 'ACADEMIC', roleTeacher: 'TEACHER' },
  { key: 'subjectTeacher', email: 'demo.teacher.science@ssps.invalid', username: 'Demo Science Subject Teacher', legacyRole: 'TEACHER', accessRole: 'SUBJECT_TEACHER', scope: 'CLASS', department: 'ACADEMIC', roleTeacher: 'TEACHER' },
  { key: 'languages', email: 'demo.teacher.languages@ssps.invalid', username: 'Demo Languages Teacher', legacyRole: 'TEACHER', accessRole: 'TEACHER', scope: 'BRANCH', department: 'ACADEMIC', roleTeacher: 'TEACHER' },
  { key: 'mathematics', email: 'demo.teacher.mathematics@ssps.invalid', username: 'Demo Mathematics Teacher', legacyRole: 'TEACHER', accessRole: 'TEACHER', scope: 'BRANCH', department: 'ACADEMIC', roleTeacher: 'TEACHER' },
  { key: 'foundation', email: 'demo.teacher.foundation@ssps.invalid', username: 'Demo Foundation Teacher', legacyRole: 'TEACHER', accessRole: 'TEACHER', scope: 'BRANCH', department: 'ACADEMIC', roleTeacher: 'TEACHER' },
];

const demoFirstNames = ['Aarav', 'Anaya', 'Vivaan', 'Diya', 'Arjun', 'Isha', 'Kabir', 'Meera', 'Reyansh', 'Saanvi', 'Advait', 'Myra', 'Ritvik', 'Kavya', 'Ayan', 'Prisha', 'Veer', 'Ira'];
const demoLastNames = ['Training', 'Preview', 'Scholar', 'Learner', 'Explorer', 'Achiever'];

// Anonymous training records only. They are isolated to the Training & Preview
// Branch and do not contain actual children, guardian, or government data.
const demoStudents = classNames.flatMap((className, classIndex) => Array.from({ length: STUDENTS_PER_CLASS }, (_, studentIndex) => {
  const firstName = demoFirstNames[(classIndex * 3 + studentIndex) % demoFirstNames.length];
  return {
    firstName,
    lastName: demoLastNames[(classIndex + studentIndex) % demoLastNames.length],
    className,
    // Existing preview records use numeric rolls. Keep massive demo records
    // visibly separate and avoid colliding with any pre-seeded class rolls.
    rollNumber: `D${String(studentIndex + 1).padStart(3, '0')}`,
    gender: studentIndex % 2 === 0 ? 'Male' : 'Female',
    seedIndex: classIndex * STUDENTS_PER_CLASS + studentIndex,
  };
}));

const counts = { created: {}, existing: {} };

function record(bucket, key) {
  bucket[key] = (bucket[key] || 0) + 1;
}

function day(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function scopeFor(spec, schoolId, branchId, classIds) {
  const scope = { scopeType: spec.scope, schoolId: null, branchId: null, classId: null };
  if (spec.scope === 'SCHOOL') scope.schoolId = schoolId;
  if (spec.scope === 'BRANCH') {
    scope.schoolId = schoolId;
    scope.branchId = branchId;
  }
  if (spec.scope === 'CLASS') {
    scope.schoolId = schoolId;
    scope.branchId = branchId;
    scope.classId = classIds[spec.className || (spec.key === 'classTeacher' ? 'V' : 'IX')];
  }
  return scope;
}

function feeValues(className, category) {
  const baseMonthly = ['LKG', 'UKG'].includes(className) ? 1200
    : ['I', 'II', 'III', 'IV'].includes(className) ? 1500
      : ['V', 'VI', 'VII', 'VIII'].includes(className) ? 1800
        : ['IX', 'X', 'XS'].includes(className) ? 2200 : 2800;
  const baseAdmission = ['LKG', 'UKG'].includes(className) ? 3500
    : ['I', 'II', 'III', 'IV'].includes(className) ? 4500
      : ['V', 'VI', 'VII', 'VIII'].includes(className) ? 5500
        : ['IX', 'X', 'XS'].includes(className) ? 6500 : 7500;
  const multiplier = {
    KSAT_SUPPORT_PLUS: 0.6,
    KSAT_SUPPORT: 0.75,
    KSAT_STANDARD: 0.9,
    KSAT_GENERAL: 1,
    DIRECT_GENERAL: 1.1,
  }[category];
  return {
    monthlyFee: Math.round(baseMonthly * multiplier),
    admissionFee: Math.round(baseAdmission * multiplier),
    readmissionFee: Math.round(baseAdmission * multiplier * 0.55),
  };
}

function teacherKeyFor(subjectSlug) {
  if (['english', 'bengali', 'hindi', 'history', 'geography', 'social-science'].includes(subjectSlug)) return 'languages';
  if (['mathematics', 'physics', 'chemistry', 'computer-science', 'computer-applications'].includes(subjectSlug)) return 'mathematics';
  if (['science', 'physical-science', 'life-science', 'biology'].includes(subjectSlug)) return 'subjectTeacher';
  return 'foundation';
}

async function mustFindFoundation() {
  const [school, mainBranch] = await Promise.all([
    prisma.school.findUnique({ where: { slug: SCHOOL_SLUG } }),
    prisma.schoolBranch.findUnique({ where: { code: MAIN_BRANCH_CODE } }),
  ]);
  if (!school || !mainBranch || mainBranch.schoolId !== school.id) {
    throw new Error('Expected school foundation is missing. Run the student migration before the full system seed.');
  }
  return { school, mainBranch };
}

async function ensureTrainingBranch(school) {
  const existing = await prisma.schoolBranch.findUnique({ where: { code: TRAINING_BRANCH.code } });
  if (existing) {
    record(counts.existing, 'trainingBranch');
    return existing;
  }
  const created = await prisma.schoolBranch.create({ data: { schoolId: school.id, ...TRAINING_BRANCH } });
  record(counts.created, 'trainingBranch');
  return created;
}

async function ensureClass(schoolId, branchId, name, roomNumber = null) {
  const existing = await prisma.schoolClass.findFirst({ where: { schoolId, branchId, name, section: 'A', academicYear: ACADEMIC_YEAR } });
  if (existing) {
    record(counts.existing, 'classes');
    return existing;
  }
  const created = await prisma.schoolClass.create({
    data: { schoolId, branchId, name, section: 'A', academicYear: ACADEMIC_YEAR, roomNumber },
  });
  record(counts.created, 'classes');
  return created;
}

async function ensureSubject(slug, name, description) {
  const existing = await prisma.subject.findUnique({ where: { slug } });
  if (existing) {
    record(counts.existing, 'subjects');
    return existing;
  }
  const created = await prisma.subject.create({ data: { slug, name, description } });
  record(counts.created, 'subjects');
  return created;
}

async function ensureFeeScheme(classId, className, category) {
  const existing = await prisma.feeScheme.findFirst({ where: { classId, category } });
  if (existing) {
    record(counts.existing, 'feeSchemes');
    return existing;
  }
  const created = await prisma.feeScheme.create({ data: { classId, category, ...feeValues(className, category) } });
  record(counts.created, 'feeSchemes');
  return created;
}

async function ensureStaffUsers(school, trainingBranch, classIds) {
  const requiredPassword = process.env.SSPS_DEMO_STAFF_PASSWORD;
  const missingEmails = [];
  for (const spec of staffSpecs) {
    const existing = await prisma.user.findUnique({ where: { email: spec.email } });
    if (!existing) missingEmails.push(spec.email);
  }
  if (missingEmails.length && (!requiredPassword || requiredPassword.length < 16)) {
    throw new Error('Set SSPS_DEMO_STAFF_PASSWORD to a unique temporary password of at least 16 characters before first --apply. It is hashed and never stored in this script.');
  }
  const passwordHash = missingEmails.length ? await bcrypt.hash(requiredPassword, 12) : null;
  const accessRoles = await prisma.accessRole.findMany({ where: { code: { in: staffSpecs.map((spec) => spec.accessRole) } }, select: { id: true, code: true } });
  const roleByCode = new Map(accessRoles.map((role) => [role.code, role]));
  const missingRoles = [...new Set(staffSpecs.map((spec) => spec.accessRole))].filter((code) => !roleByCode.has(code));
  if (missingRoles.length) throw new Error(`RBAC roles are missing: ${missingRoles.join(', ')}. Run npm run rbac:seed first.`);

  const users = {};
  for (const spec of staffSpecs) {
    let user = await prisma.user.findUnique({ where: { email: spec.email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: spec.email,
          username: spec.username,
          password: passwordHash,
          is_active: true,
          blocked: false,
          confirmed: true,
          role: spec.legacyRole,
          role_teacher: spec.roleTeacher || null,
          department: spec.department,
          schoolId: school.id,
          branchId: trainingBranch.id,
          created_at: new Date(),
          updated_at: new Date(),
        },
      });
      record(counts.created, 'staffUsers');
    } else {
      record(counts.existing, 'staffUsers');
    }
    users[spec.key] = user;

    const role = roleByCode.get(spec.accessRole);
    const expectedScope = scopeFor(spec, school.id, trainingBranch.id, classIds);
    const assignment = await prisma.userAccessRole.findFirst({
      where: { userId: user.id, roleId: role.id, ...expectedScope, isActive: true },
    });
    if (!assignment) {
      await prisma.userAccessRole.create({ data: { userId: user.id, roleId: role.id, ...expectedScope, isActive: true } });
      record(counts.created, 'rbacAssignments');
    } else {
      record(counts.existing, 'rbacAssignments');
    }
  }
  return users;
}

async function ensureDepartments(schoolId) {
  const definitions = [
    ['academic-programme', 'Academic Programme', 'ACADEMIC'],
    ['operations-control', 'Operations Control', 'ADMINISTRATION'],
    ['finance-examinations', 'Finance & Examinations', 'ADMINISTRATION'],
    ['guardian-communication', 'Guardian Communication', 'STUDENT_WELFARE'],
    ['system-support', 'System Support', 'TECHNICAL_SUPPORT'],
  ];
  for (const [slug, name, type] of definitions) {
    const existing = await prisma.department.findUnique({ where: { slug } });
    if (existing) {
      record(counts.existing, 'departments');
      continue;
    }
    await prisma.department.create({
      data: { schoolId, slug, name, type, description: `Seeded ${name} department for system verification.` },
    });
    record(counts.created, 'departments');
  }
}

async function ensureTrainingClassTeacher(trainingClassesByName, staff) {
  const teacherPool = [staff.classTeacher, staff.subjectTeacher, staff.languages, staff.mathematics, staff.foundation].filter(Boolean);
  for (const [index, schoolClass] of [...trainingClassesByName.values()].entries()) {
    if (schoolClass.classTeacherId != null) {
      record(counts.existing, 'classTeacherAssignments');
      continue;
    }
    const teacher = teacherPool[index % teacherPool.length];
    await prisma.schoolClass.update({ where: { id: schoolClass.id }, data: { classTeacherId: teacher.id } });
    schoolClass.classTeacherId = teacher.id;
    record(counts.created, 'classTeacherAssignments');
  }
}

async function ensureClassSubjects(classes, subjectBySlug, staff, isTraining) {
  const byClassSubject = new Map();
  for (const schoolClass of classes) {
    for (const subjectSlug of subjectSlugsByClass[schoolClass.name] || []) {
      const subject = subjectBySlug.get(subjectSlug);
      const existing = await prisma.classSubject.findFirst({ where: { classId: schoolClass.id, subjectId: subject.id } });
      if (existing) {
        record(counts.existing, 'classSubjects');
        byClassSubject.set(`${schoolClass.name}:${subjectSlug}`, existing);
        continue;
      }
      const teacher = isTraining ? staff[teacherKeyFor(subjectSlug)] : null;
      const created = await prisma.classSubject.create({
        data: {
          classId: schoolClass.id,
          subjectId: subject.id,
          branchId: schoolClass.branchId,
          schoolId: schoolClass.schoolId,
          teacherId: teacher?.id || null,
          syllabus: { seed: true, academicYear: ACADEMIC_YEAR, subject: subjectSlug },
        },
      });
      record(counts.created, 'classSubjects');
      byClassSubject.set(`${schoolClass.name}:${subjectSlug}`, created);
    }
  }
  return byClassSubject;
}

async function ensureRooms(school, trainingBranch, trainingClasses) {
  for (let index = 0; index < trainingClasses.length; index += 1) {
    const schoolClass = trainingClasses[index];
    const roomNumber = `TRAIN-${String(index + 1).padStart(2, '0')}`;
    const existing = await prisma.room.findUnique({ where: { roomNumber } });
    if (!existing) {
      await prisma.room.create({
        data: { schoolId: school.id, branchId: trainingBranch.id, roomNumber, capacity: 35, floor: index < 8 ? 'Ground' : 'First', type: 'Training classroom' },
      });
      record(counts.created, 'rooms');
    } else {
      record(counts.existing, 'rooms');
    }
    if (!schoolClass.roomNumber) {
      await prisma.schoolClass.update({ where: { id: schoolClass.id }, data: { roomNumber } });
    }
  }
}

async function ensureDemoStudents(school, trainingBranch, classesByName, directFeeSchemeByClass) {
  const students = [];
  for (const item of demoStudents) {
    const schoolClass = classesByName.get(item.className);
    const feeScheme = directFeeSchemeByClass.get(item.className);
    let student = await prisma.student.findUnique({
      where: {
        rollNumber_classId_branchId_schoolId: {
          rollNumber: item.rollNumber,
          classId: schoolClass.id,
          branchId: trainingBranch.id,
          schoolId: school.id,
        },
      },
    });
    if (!student) {
      student = await prisma.student.create({
        data: {
          admissionNumber: null,
          rollNumber: item.rollNumber,
          academicYear: ACADEMIC_YEAR,
          schoolId: school.id,
          branchId: trainingBranch.id,
          classId: schoolClass.id,
          feeSchemeId: feeScheme.id,
          studentCategory: 'DIRECT_GENERAL',
          enrollmentMode: 'SYSTEM_SEED_DEMO',
          firstName: item.firstName,
          lastName: item.lastName,
          gender: item.gender,
          admissionDate: day('2026-04-01'),
          status: 'ACTIVE',
          guardianName: `Demo Guardian ${String(item.seedIndex + 1).padStart(3, '0')}`,
          guardianRelation: 'Parent',
          guardianContact: `9000${String(item.seedIndex).padStart(6, '0')}`,
          fatherName: `Demo Father ${String(item.seedIndex + 1).padStart(3, '0')}`,
          fatherContact: `9100${String(item.seedIndex).padStart(6, '0')}`,
          fatherProfession: 'Training profile only',
          motherName: `Demo Mother ${String(item.seedIndex + 1).padStart(3, '0')}`,
          motherContact: `9200${String(item.seedIndex).padStart(6, '0')}`,
          motherProfession: 'Training profile only',
          residentialAddress: 'Training data only — no real address',
          city: 'Training',
          state: 'West Bengal',
          pinCode: '000000',
          preferredLanguage: 'English',
        },
      });
      student = await prisma.student.update({
        where: { id: student.id },
        data: { admissionNumber: formatStudentAdmissionNumber(student.id, ACADEMIC_YEAR) },
      });
      record(counts.created, 'demoStudents');
    } else {
      record(counts.existing, 'demoStudents');
    }

    let admission = await prisma.admission.findUnique({ where: { finalAdmissionNumber: student.admissionNumber } });
    if (!admission) {
      admission = await prisma.admission.create({
        data: {
          studentId: student.id,
          schoolId: school.id,
          branchId: trainingBranch.id,
          classId: schoolClass.id,
          feeSchemeId: feeScheme.id,
          admissionType: 'DIRECT',
          admissionDate: day('2026-04-01'),
          status: 'COMPLETED',
          finalAdmissionNumber: student.admissionNumber,
        },
      });
      record(counts.created, 'admissions');
    } else {
      record(counts.existing, 'admissions');
    }
    if (!student.finalAdmissionId || !student.feeSchemeId) {
      student = await prisma.student.update({
        where: { id: student.id },
        data: { finalAdmissionId: student.finalAdmissionId || admission.id, feeSchemeId: student.feeSchemeId || feeScheme.id },
      });
    }
    students.push({ ...student, admission, schoolClass, feeScheme, source: item });
  }
  return students;
}

async function ensureFeeLedger(demoStudentRecords) {
  for (let index = 0; index < demoStudentRecords.length; index += 1) {
    const recordItem = demoStudentRecords[index];
    const variants = [4, 5, 6, 7, 8, 9, 10].map((month) => {
      const cycle = (index + month) % 6;
      return {
        month,
        status: cycle <= 2 ? 'PAID' : cycle === 3 ? 'PARTIALLY_PAID' : cycle === 4 ? 'WAIVED' : 'UNPAID',
      };
    });
    for (const variant of variants) {
      const paidAmount = variant.status === 'PAID' ? recordItem.feeScheme.monthlyFee : variant.status === 'PARTIALLY_PAID' ? Math.round(recordItem.feeScheme.monthlyFee / 2) : 0;
      const waivedAmount = variant.status === 'WAIVED' ? recordItem.feeScheme.monthlyFee : 0;
      let fee = await prisma.monthlyFee.findFirst({ where: { studentId: recordItem.id, month: variant.month, year: 2026 } });
      if (!fee) {
        fee = await prisma.monthlyFee.create({
          data: {
            studentId: recordItem.id,
            admissionId: recordItem.admission.id,
            schoolId: recordItem.schoolId,
            branchId: recordItem.branchId,
            classId: recordItem.classId,
            academicYear: ACADEMIC_YEAR,
            month: variant.month,
            year: 2026,
            dueDate: day(`2026-${String(variant.month).padStart(2, '0')}-10`),
            paidAmount,
            totalDue: recordItem.feeScheme.monthlyFee,
            status: variant.status,
            isWaived: variant.status === 'WAIVED',
            waivedAmount,
            remarks: 'SYSTEM_SEED_DEMO: training ledger entry',
          },
        });
        record(counts.created, 'monthlyFees');
      } else {
        record(counts.existing, 'monthlyFees');
      }
      if (paidAmount > 0) {
        const transactionId = `SEED-MF-${recordItem.admissionNumber}-${variant.month}-2026`;
        const payment = await prisma.monthlyFeePayment.findFirst({ where: { transactionId } });
        if (!payment) {
          await prisma.monthlyFeePayment.create({
            data: { monthlyFeeId: fee.id, amount: paidAmount, paymentDate: day(`2026-${String(variant.month).padStart(2, '0')}-08`), method: index % 2 === 0 ? 'UPI' : 'CASH', transactionId, receivedBy: 'SYSTEM_SEED_DEMO', remarks: 'Training payment only' },
          });
          record(counts.created, 'monthlyFeePayments');
        } else {
          record(counts.existing, 'monthlyFeePayments');
        }
      }
    }
  }
}

async function ensureStudentOperations(records, classSubjects, staff) {
  const targetClassNames = classNames;
  for (const [recordIndex, recordItem] of records.entries()) {
    for (const [offset, status] of ['PRESENT', 'ABSENT', 'PRESENT'].entries()) {
      const date = day(`2026-10-${String(12 + offset).padStart(2, '0')}`);
      const existing = await prisma.attendance.findFirst({ where: { studentId: recordItem.id, date } });
      if (!existing) {
        await prisma.attendance.create({ data: { studentId: recordItem.id, classId: recordItem.classId, branchId: recordItem.branchId, schoolId: recordItem.schoolId, date, status } });
        record(counts.created, 'attendance');
      } else record(counts.existing, 'attendance');

      const classSubject = classSubjects.get(`${recordItem.source.className}:${recordItem.source.className === 'IX' ? 'physical-science' : 'mathematics'}`)
        || classSubjects.get(`${recordItem.source.className}:${subjectSlugsByClass[recordItem.source.className][0]}`);
      if (classSubject) {
        const completion = await prisma.dailyHomeworkCompletion.findFirst({ where: { studentId: recordItem.id, subjectId: classSubject.id, date } });
        if (!completion) {
          await prisma.dailyHomeworkCompletion.create({
            data: { studentId: recordItem.id, subjectId: classSubject.id, classId: recordItem.classId, branchId: recordItem.branchId, schoolId: recordItem.schoolId, date, status: offset === 1 ? 'LATE' : 'SUBMITTED' },
          });
          record(counts.created, 'homeworkCompletions');
        } else record(counts.existing, 'homeworkCompletions');
      }
    }
  }

  for (const className of targetClassNames) {
    const studentsInClass = records.filter((recordItem) => recordItem.source.className === className);
    const subjectSlug = subjectSlugsByClass[className].includes('mathematics') ? 'mathematics' : subjectSlugsByClass[className][0];
    const classSubject = classSubjects.get(`${className}:${subjectSlug}`);
    if (!classSubject || !studentsInClass.length) continue;
    let assignment = await prisma.assignment.findFirst({ where: { classSubjectId: classSubject.id, assignmentNumber: 1 } });
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          classSubjectId: classSubject.id,
          title: `Training ${className} ${subjectSlug} assignment`,
          description: 'SYSTEM_SEED_DEMO: a safe training assignment used to verify student work endpoints.',
          dueDate: day('2026-10-20'),
          assignmentNumber: 1,
          biWeeklySlotStart: day('2026-10-05'),
          biWeeklySlotEnd: day('2026-10-18'),
          marks: { maximum: 20 },
        },
      });
      record(counts.created, 'assignments');
    } else record(counts.existing, 'assignments');

    for (const [index, student] of studentsInClass.entries()) {
      const existing = await prisma.studentAssignment.findFirst({ where: { studentId: student.id, assignmentId: assignment.id } });
      if (!existing) {
        await prisma.studentAssignment.create({ data: { studentId: student.id, assignmentId: assignment.id, isSubmitted: index === 0, submittedAt: index === 0 ? day('2026-10-17') : null, marksObtained: index === 0 ? 18 : null, qualityTag: index === 0 ? 'GOOD' : null, remarks: 'Training record' } });
        record(counts.created, 'studentAssignments');
      } else record(counts.existing, 'studentAssignments');
    }

    let test = await prisma.test.findFirst({ where: { classSubjectId: classSubject.id, title: `Training ${className} ${subjectSlug} assessment` } });
    if (!test) {
      test = await prisma.test.create({ data: { title: `Training ${className} ${subjectSlug} assessment`, classSubjectId: classSubject.id, testType: 'Monthly', syllabus: 'Seeded training unit', marks: 30, biWeeklySlotStart: day('2026-10-05'), biWeeklySlotEnd: day('2026-10-18') } });
      record(counts.created, 'tests');
    } else record(counts.existing, 'tests');
    for (const [index, student] of studentsInClass.entries()) {
      const existing = await prisma.testMark.findFirst({ where: { studentId: student.id, testId: test.id } });
      if (!existing) {
        await prisma.testMark.create({ data: { studentId: student.id, testId: test.id, maxMarks: 30, marks: index === 0 ? 25 : 21, remarks: 'Training assessment result' } });
        record(counts.created, 'testMarks');
      } else record(counts.existing, 'testMarks');
    }

    const syllabusTopic = `Training ${className} unit 1`;
    const existingTopic = await prisma.subjectSyllabus.findFirst({ where: { subjectId: classSubject.id, topic: syllabusTopic } });
    let topic = existingTopic;
    if (!topic) {
      topic = await prisma.subjectSyllabus.create({ data: { subjectId: classSubject.id, topic: syllabusTopic, lectureContent: 'SYSTEM_SEED_DEMO: endpoint verification lesson.', isCompleted: false } });
      record(counts.created, 'subjectSyllabus');
    } else record(counts.existing, 'subjectSyllabus');
    const planDate = day('2026-10-16');
    const existingPlan = await prisma.syllabusScheduleDailyPlan.findFirst({ where: { classSubjectId: classSubject.id, date: planDate } });
    if (!existingPlan) {
      await prisma.syllabusScheduleDailyPlan.create({ data: { classSubjectId: classSubject.id, syllabusId: topic.id, date: planDate, topicTitle: syllabusTopic, instructions_for_students: 'Complete the training worksheet.', homeworkDescription: 'Solve the practice questions.', homeworkDueDate: day('2026-10-20') } });
      record(counts.created, 'dailyPlans');
    } else record(counts.existing, 'dailyPlans');
  }

  for (const recordItem of records) {
    const summary = `SYSTEM_SEED_DEMO: ${recordItem.source.className} guardian check-in`;
    const existingCommunication = await prisma.guardianCommunicationLog.findFirst({ where: { studentId: recordItem.id, summary } });
    if (!existingCommunication) {
      await prisma.guardianCommunicationLog.create({ data: { studentId: recordItem.id, classId: recordItem.classId, branchId: recordItem.branchId, schoolId: recordItem.schoolId, communicationType: 'GENERAL', method: 'PHONE', summary, details: { seeded: true, outcome: 'Training-only acknowledgement' }, recordedById: staff.gci.id, recordedAt: day('2026-10-15') } });
      record(counts.created, 'guardianCommunications');
    } else record(counts.existing, 'guardianCommunications');

    const call = await prisma.guardianCallLog.findFirst({ where: { studentId: recordItem.id, reportWeekStart: day('2026-10-12'), reportWeekEnd: day('2026-10-18') } });
    if (!call) {
      await prisma.guardianCallLog.create({ data: { studentId: recordItem.id, classId: recordItem.classId, branchId: recordItem.branchId, schoolId: recordItem.schoolId, reportWeekStart: day('2026-10-12'), reportWeekEnd: day('2026-10-18'), callDate: day('2026-10-15'), calledById: staff.gci.id, issuesDiscussed: { seeded: true, topic: 'Training attendance and homework review' }, guardianResponse: 'Training-only acknowledgement.' } });
      record(counts.created, 'guardianCalls');
    } else record(counts.existing, 'guardianCalls');

    const meetingDate = day('2026-10-17');
    const meeting = await prisma.parentTeacherMeetingNote.findFirst({ where: { studentId: recordItem.id, meetingDate } });
    if (!meeting) {
      await prisma.parentTeacherMeetingNote.create({
        data: {
          studentId: recordItem.id,
          classId: recordItem.classId,
          branchId: recordItem.branchId,
          schoolId: recordItem.schoolId,
          meetingDate,
          takenById: staff.gci.id,
          summary_realization: 'SYSTEM_SEED_DEMO: academic and attendance progress review.',
          guardianInstruction: 'Training-only guardian follow-up note.',
          guardianFeedback: 'Demo guardian acknowledgement recorded for panel verification.',
          actionPoints: [{ action: 'Review homework completion weekly', dueBy: '2026-10-31' }],
        },
      });
      record(counts.created, 'parentTeacherMeetings');
    } else record(counts.existing, 'parentTeacherMeetings');

    if (recordItem.source.seedIndex % 4 === 0) {
      const note = 'SYSTEM_SEED_DEMO: guardian requested regular academic progress updates.';
      const existingNote = await prisma.guardianStudentSpecialNote.findFirst({ where: { studentId: recordItem.id, note } });
      if (!existingNote) {
        await prisma.guardianStudentSpecialNote.create({ data: { studentId: recordItem.id, classId: recordItem.classId, branchId: recordItem.branchId, schoolId: recordItem.schoolId, note, priority: recordItem.source.seedIndex % 8 === 0 ? 'HIGH' : 'NORMAL', createdById: staff.gci.id } });
        record(counts.created, 'guardianSpecialNotes');
      } else record(counts.existing, 'guardianSpecialNotes');
    }

    if (recordItem.source.seedIndex % 5 === 0) {
      const incidentDate = day('2026-10-14');
      const behaviour = await prisma.studentBehaviourLog.findFirst({ where: { studentId: recordItem.id, incidentDate, type: 'Training homework follow-up' } });
      if (!behaviour) {
        await prisma.studentBehaviourLog.create({ data: { studentId: recordItem.id, incidentDate, category: 'ACADEMIC', type: 'Training homework follow-up', description: 'SYSTEM_SEED_DEMO: low-risk academic follow-up for behaviour-panel verification.', severityLevel: 1, isResolved: recordItem.source.seedIndex % 10 === 0, resolvedBy: recordItem.source.seedIndex % 10 === 0 ? staff.classTeacher.username : null, resolvedNote: recordItem.source.seedIndex % 10 === 0 ? 'Training follow-up completed.' : null } });
        record(counts.created, 'behaviourLogs');
      } else record(counts.existing, 'behaviourLogs');
    }
  }
}

async function ensureClassExperienceContent(trainingClasses, classSubjects, records, staff) {
  for (const [classIndex, schoolClass] of trainingClasses.entries()) {
    const classRecords = records.filter((recordItem) => recordItem.classId === schoolClass.id);
    const classSubject = classSubjects.get(`${schoolClass.name}:${subjectSlugsByClass[schoolClass.name][0]}`);
    if (!classSubject || !classRecords.length) continue;

    const schedule = await prisma.semesterExamSchedule.findFirst({ where: { classSubjectId: classSubject.id, semester: 'SEMESTER_I' } });
    if (!schedule) {
      await prisma.semesterExamSchedule.create({ data: { classSubjectId: classSubject.id, classId: schoolClass.id, subjectId: classSubject.subjectId, schoolId: schoolClass.schoolId, semester: 'SEMESTER_I', examDate: day(`2026-11-${String(3 + (classIndex % 20)).padStart(2, '0')}`), durationMinutes: 90, examHall: schoolClass.roomNumber || `TRAIN-${String(classIndex + 1).padStart(2, '0')}` } });
      record(counts.created, 'semesterExamSchedules');
    } else record(counts.existing, 'semesterExamSchedules');

    for (const [studentIndex, student] of classRecords.entries()) {
      const existingResult = await prisma.semesterResult.findFirst({ where: { studentId: student.id, classSubjectId: classSubject.id, semester: 'SEMESTER_I' } });
      if (!existingResult) {
        const semesterExamMarks = 48 + (studentIndex % 19);
        const vivaMarks = 4 + (studentIndex % 3);
        const internalMarks = 18 + (studentIndex % 7);
        await prisma.semesterResult.create({ data: { studentId: student.id, classSubjectId: classSubject.id, classId: schoolClass.id, branchId: schoolClass.branchId, schoolId: schoolClass.schoolId, subjectId: classSubject.subjectId, semester: 'SEMESTER_I', semesterExamMarks, vivaMarks, internalMarks, totalMarks: semesterExamMarks + vivaMarks + internalMarks, remarks: 'SYSTEM_SEED_DEMO: semester result for training verification.' } });
        record(counts.created, 'semesterResults');
      } else record(counts.existing, 'semesterResults');

      const legacyFee = await prisma.fee.findFirst({ where: { studentId: student.id, dueDate: day('2026-10-10') } });
      if (!legacyFee) {
        await prisma.fee.create({ data: { studentId: student.id, classId: schoolClass.id, branchId: schoolClass.branchId, schoolId: schoolClass.schoolId, amount: student.feeScheme.monthlyFee, dueDate: day('2026-10-10'), status: studentIndex % 3 === 0 ? 'PAID' : 'DUE' } });
        record(counts.created, 'legacyFees');
      } else record(counts.existing, 'legacyFees');
    }

    const lifeTitle = `SYSTEM_SEED_DEMO: ${schoolClass.name} hydration routine`;
    const lifeInstruction = await prisma.classLifeSystemInstruction.findFirst({ where: { classId: schoolClass.id, title: lifeTitle } });
    if (!lifeInstruction) {
      await prisma.classLifeSystemInstruction.create({ data: { classId: schoolClass.id, title: lifeTitle, description: 'Training-only healthy-habit prompt for panel review.', timeOfDay: 'Morning', weekDay: 'MONDAY', frequency: 'WEEKLY', createdBy: staff.aic.id } });
      record(counts.created, 'lifeInstructions');
    } else record(counts.existing, 'lifeInstructions');

    const foodTitle = `SYSTEM_SEED_DEMO: ${schoolClass.name} balanced snack`;
    const foodInstruction = await prisma.classFoodInstruction.findFirst({ where: { classId: schoolClass.id, title: foodTitle } });
    if (!foodInstruction) {
      await prisma.classFoodInstruction.create({ data: { classId: schoolClass.id, title: foodTitle, description: 'Training-only nutrition suggestion for interface verification.', foodType: 'BALANCED', suggestedItems: [{ name: 'Seasonal fruit', quantity: '1 serving', benefit: 'Balanced energy' }], timeOfDay: 'Snack', weekDay: 'WEDNESDAY', frequency: 'WEEKLY' } });
      record(counts.created, 'foodInstructions');
    } else record(counts.existing, 'foodInstructions');

    const cdtpTitle = `SYSTEM_SEED_DEMO: ${schoolClass.name} career focus`;
    const cdtp = await prisma.knightsCdtpSession.findFirst({ where: { classId: schoolClass.id, title: cdtpTitle } });
    if (!cdtp) {
      await prisma.knightsCdtpSession.create({ data: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, sessionDate: day('2026-10-19'), sessionType: 'CAREER_FLASHCARD', title: cdtpTitle, content: 'Training-only career-learning material.', isUnlocked: true, unlockReason: 'Demo preview' } });
      record(counts.created, 'cdtpSessions');
    } else record(counts.existing, 'cdtpSessions');

    const occasionTitle = `SYSTEM_SEED_DEMO: ${schoolClass.name} speaking occasion`;
    let occasion = await prisma.publicSpeakingOccasion.findFirst({ where: { classId: schoolClass.id, title: occasionTitle } });
    if (!occasion) {
      occasion = await prisma.publicSpeakingOccasion.create({ data: { classId: schoolClass.id, schoolId: schoolClass.schoolId, branchId: schoolClass.branchId, title: occasionTitle, description: 'Training-only public speaking event.', occasionDate: day('2026-11-12'), languageMedium: 'ENGLISH', isActive: true } });
      record(counts.created, 'speakingOccasions');
    } else record(counts.existing, 'speakingOccasions');
    const firstStudent = classRecords[0];
    const submission = await prisma.publicSpeechSubmission.findFirst({ where: { studentId: firstStudent.id, occasionId: occasion.id } });
    if (!submission) {
      await prisma.publicSpeechSubmission.create({ data: { studentId: firstStudent.id, occasionId: occasion.id, title: 'Training speech submission', language: 'ENGLISH', youtubeViews: 0, approvedByTeacherId: staff.classTeacher.id } });
      record(counts.created, 'speechSubmissions');
    } else record(counts.existing, 'speechSubmissions');

    const suggestion = await prisma.improvementSuggestion.findFirst({ where: { studentId: firstStudent.id, month: 10, year: 2026 } });
    if (!suggestion) {
      await prisma.improvementSuggestion.create({ data: { studentId: firstStudent.id, classId: schoolClass.id, branchId: schoolClass.branchId, schoolId: schoolClass.schoolId, submittedBy: 'GUARDIAN', month: 10, year: 2026, category: 'HOMEWORK', message: 'SYSTEM_SEED_DEMO: guardian requests regular homework status updates.', responseMessage: 'Training response: weekly review scheduled.' } });
      record(counts.created, 'improvementSuggestions');
    } else record(counts.existing, 'improvementSuggestions');
  }
}

async function ensureRoutines(trainingClasses, trainingClassSubjects) {
  for (const schoolClass of trainingClasses) {
    const classSubject = trainingClassSubjects.get(`${schoolClass.name}:${subjectSlugsByClass[schoolClass.name][0]}`);
    if (!classSubject) continue;
    const existing = await prisma.routine.findFirst({ where: { classId: schoolClass.id, day: 'Monday', startTime: '09:00' } });
    if (!existing) {
      await prisma.routine.create({ data: { classId: schoolClass.id, branchId: schoolClass.branchId, schoolId: schoolClass.schoolId, day: 'Monday', startTime: '09:00', endTime: '09:45', subjectId: classSubject.subjectId, classSubjectId: classSubject.id } });
      record(counts.created, 'routines');
    } else record(counts.existing, 'routines');
  }
}

async function ensureTeacherAssignments(staff, subjectBySlug, trainingBranch, school) {
  const assignments = [
    ['languages', ['english', 'bengali', 'hindi', 'history', 'geography', 'social-science']],
    ['mathematics', ['mathematics', 'computer-science', 'computer-applications', 'physics', 'chemistry']],
    ['subjectTeacher', ['science', 'physical-science', 'life-science', 'biology']],
    ['foundation', ['environmental-studies', 'art-craft', 'physical-education', 'general-knowledge']],
  ];
  for (const [staffKey, subjectSlugs] of assignments) {
    for (const slug of subjectSlugs) {
      const subject = subjectBySlug.get(slug);
      const existing = await prisma.teacherSubjectAssignment.findFirst({ where: { teacherId: staff[staffKey].id, subjectId: subject.id } });
      if (!existing) {
        await prisma.teacherSubjectAssignment.create({ data: { teacherId: staff[staffKey].id, subjectId: subject.id, assignedById: staff.aic.id } });
        record(counts.created, 'teacherSubjectAssignments');
      } else record(counts.existing, 'teacherSubjectAssignments');
    }
  }

  const branchRoles = [
    ['principal', 'PRINCIPAL_HEAD'],
    ['aic', 'ACADEMICS_IN_CHARGE'],
    ['coe', 'HEAD_OF_DEPARTMENTS'],
    ['coef', 'FMO'],
    ['gci', 'GCI'],
    ['system', 'SYSTEM_IN_CHARGE'],
  ];
  for (const [staffKey, role] of branchRoles) {
    const existing = await prisma.branchRoleAssignment.findFirst({ where: { branchId: trainingBranch.id, role } });
    if (!existing) {
      await prisma.branchRoleAssignment.create({ data: { userId: staff[staffKey].id, branchId: trainingBranch.id, schoolId: school.id, role, startDate: day('2026-04-01') } });
      record(counts.created, 'branchRoleAssignments');
    } else record(counts.existing, 'branchRoleAssignments');
  }
}

async function ensureStaffOperations(staff) {
  const staffForOperations = Object.values(staff);
  for (const user of staffForOperations) {
    for (const dateValue of ['2026-10-14', '2026-10-15']) {
      const date = day(dateValue);
      const existing = await prisma.employee_attendance_logs.findFirst({ where: { user_id: user.id, date } });
      if (!existing) {
        await prisma.employee_attendance_logs.create({ data: { user_id: user.id, date, entry_time: '09:00:00', leave_time: '17:30:00', total_hours: 8.5, late_minutes: 0, overtime_minutes: 0, penalty: 0, net_salary_of_the_day: 1000, base_salary_per_day: 1000, created_at: new Date(), updated_at: new Date() } });
        record(counts.created, 'staffAttendance');
      } else record(counts.existing, 'staffAttendance');
    }
    const salaryMonth = day('2026-10-01');
    let salary = await prisma.employee_salaries.findFirst({ where: { user_id: user.id, month_year: salaryMonth } });
    if (!salary) {
      salary = await prisma.employee_salaries.create({ data: { user_id: user.id, month_year: salaryMonth, total_hours_worked: 17, payment_status: 'PARTIALLY_PAID', allowances: 0, total_late_deduction: 0, total_overtime_bonus: 0, total_sell_bonus: 0, net_salary: 25000, salary_paid: 10000, remaining_salary_of_month: 15000, created_at: new Date(), updated_at: new Date() } });
      record(counts.created, 'staffSalaryRecords');
    } else record(counts.existing, 'staffSalaryRecords');
    const payment = await prisma.salary_paid_logs.findFirst({ where: { salary_id: salary.id, paid_by_user_id: staff.coef.id } });
    if (!payment) {
      await prisma.salary_paid_logs.create({ data: { user_id: user.id, salary_id: salary.id, paid_amount: 10000, paid_on: day('2026-10-15'), payment_mode: 'BANK_TRANSFER', note: 'SYSTEM_SEED_DEMO: partial salary payment', paid_by_user_id: staff.coef.id } });
      record(counts.created, 'salaryPayments');
    } else record(counts.existing, 'salaryPayments');
  }
}

async function ensureHolidays() {
  const dates = [
    ['2026-10-02', 'Training holiday: Gandhi Jayanti'],
    ['2026-10-24', 'Training holiday: festival recess'],
  ];
  for (const [dateValue, title] of dates) {
    const date = day(dateValue);
    const existing = await prisma.holidayCalendar.findFirst({ where: { date, title } });
    if (!existing) {
      await prisma.holidayCalendar.create({ data: { date, title } });
      record(counts.created, 'holidays');
    } else record(counts.existing, 'holidays');
  }
}

async function currentReport() {
  const [school, trainingBranch, mainBranch] = await Promise.all([
    prisma.school.findUnique({ where: { slug: SCHOOL_SLUG }, select: { id: true, name: true } }),
    prisma.schoolBranch.findUnique({ where: { code: TRAINING_BRANCH.code }, select: { id: true, name: true } }),
    prisma.schoolBranch.findUnique({ where: { code: MAIN_BRANCH_CODE }, select: { id: true, name: true } }),
  ]);
  const countsReport = await Promise.all([
    prisma.schoolClass.count({ where: { academicYear: ACADEMIC_YEAR } }),
    prisma.subject.count(),
    prisma.classSubject.count(),
    prisma.feeScheme.count(),
    prisma.user.count({ where: { email: { endsWith: '@ssps.invalid' } } }),
    prisma.student.count({ where: { enrollmentMode: 'SYSTEM_SEED_DEMO' } }),
    prisma.admission.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.monthlyFee.count({ where: { remarks: 'SYSTEM_SEED_DEMO: training ledger entry' } }),
    prisma.attendance.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.assignment.count({ where: { title: { startsWith: 'Training ' } } }),
    prisma.guardianCommunicationLog.count({ where: { summary: { startsWith: 'SYSTEM_SEED_DEMO:' } } }),
    prisma.monthlyFeePayment.count({ where: { monthlyFee: { remarks: 'SYSTEM_SEED_DEMO: training ledger entry' } } }),
    prisma.dailyHomeworkCompletion.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.studentAssignment.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.test.count({ where: { title: { startsWith: 'Training ' } } }),
    prisma.testMark.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.subjectSyllabus.count({ where: { topic: { startsWith: 'Training ' } } }),
    prisma.syllabusScheduleDailyPlan.count({ where: { topicTitle: { startsWith: 'Training ' } } }),
    prisma.guardianCallLog.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.parentTeacherMeetingNote.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.guardianStudentSpecialNote.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.studentBehaviourLog.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.fee.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.semesterResult.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.semesterExamSchedule.count({ where: { class: { branch: { code: TRAINING_BRANCH.code } } } }),
    prisma.classLifeSystemInstruction.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }),
    prisma.classFoodInstruction.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }),
    prisma.knightsCdtpSession.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }),
    prisma.publicSpeakingOccasion.count({ where: { title: { startsWith: 'SYSTEM_SEED_DEMO:' } } }),
    prisma.publicSpeechSubmission.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
    prisma.improvementSuggestion.count({ where: { student: { enrollmentMode: 'SYSTEM_SEED_DEMO' } } }),
  ]);
  return {
    academicYear: ACADEMIC_YEAR,
    school,
    mainBranch,
    trainingBranch,
    counts: {
      classes: countsReport[0], subjects: countsReport[1], classSubjects: countsReport[2], feeSchemes: countsReport[3],
      demoStaff: countsReport[4], demoStudents: countsReport[5], demoAdmissions: countsReport[6], demoMonthlyFees: countsReport[7],
      demoAttendance: countsReport[8], demoAssignments: countsReport[9], demoGuardianLogs: countsReport[10],
      demoFeePayments: countsReport[11], demoHomeworkCompletions: countsReport[12], demoStudentAssignments: countsReport[13],
      demoTests: countsReport[14], demoTestMarks: countsReport[15], demoSyllabusTopics: countsReport[16], demoDailyPlans: countsReport[17],
      demoGuardianCalls: countsReport[18], demoParentTeacherMeetings: countsReport[19], demoGuardianSpecialNotes: countsReport[20],
      demoBehaviourLogs: countsReport[21], demoLegacyFees: countsReport[22], demoSemesterResults: countsReport[23],
      demoExamSchedules: countsReport[24], demoLifeInstructions: countsReport[25], demoFoodInstructions: countsReport[26],
      demoCdtpSessions: countsReport[27], demoSpeakingOccasions: countsReport[28], demoSpeechSubmissions: countsReport[29],
      demoImprovementSuggestions: countsReport[30],
    },
  };
}

async function run() {
  if (!APPLY && !CHECK) throw new Error('Use --check for a read-only report or --apply to seed the system.');
  const before = await currentReport();
  if (CHECK) {
    console.log(JSON.stringify({ mode: 'check', ...before }, null, 2));
    return;
  }

  const { school, mainBranch } = await mustFindFoundation();
  const trainingBranch = await ensureTrainingBranch(school);
  const mainClasses = [];
  const trainingClasses = [];
  for (const [index, name] of classNames.entries()) {
    mainClasses.push(await ensureClass(school.id, mainBranch.id, name));
    trainingClasses.push(await ensureClass(school.id, trainingBranch.id, name, `TRAIN-${String(index + 1).padStart(2, '0')}`));
  }
  await ensureRooms(school, trainingBranch, trainingClasses);
  const classIds = Object.fromEntries(trainingClasses.map((schoolClass) => [schoolClass.name, schoolClass.id]));
  const staff = await ensureStaffUsers(school, trainingBranch, classIds);
  const trainingClassesByName = new Map(trainingClasses.map((schoolClass) => [schoolClass.name, schoolClass]));
  await ensureTrainingClassTeacher(trainingClassesByName, staff);
  await ensureDepartments(school.id);
  const subjectBySlug = new Map();
  for (const [slug, name, description] of subjects) subjectBySlug.set(slug, await ensureSubject(slug, name, description));

  const directFeeSchemeByClass = new Map();
  for (const schoolClass of [...mainClasses, ...trainingClasses]) {
    for (const category of ['KSAT_SUPPORT_PLUS', 'KSAT_SUPPORT', 'KSAT_STANDARD', 'KSAT_GENERAL', 'DIRECT_GENERAL']) {
      const feeScheme = await ensureFeeScheme(schoolClass.id, schoolClass.name, category);
      if (schoolClass.branchId === trainingBranch.id && category === 'DIRECT_GENERAL') directFeeSchemeByClass.set(schoolClass.name, feeScheme);
    }
  }

  const mainClassSubjects = await ensureClassSubjects(mainClasses, subjectBySlug, staff, false);
  const trainingClassSubjects = await ensureClassSubjects(trainingClasses, subjectBySlug, staff, true);
  await ensureRoutines(trainingClasses, trainingClassSubjects);
  await ensureTeacherAssignments(staff, subjectBySlug, trainingBranch, school);
  const seededStudents = await ensureDemoStudents(school, trainingBranch, trainingClassesByName, directFeeSchemeByClass);
  await ensureFeeLedger(seededStudents);
  await ensureStudentOperations(seededStudents, trainingClassSubjects, staff);
  await ensureClassExperienceContent(trainingClasses, trainingClassSubjects, seededStudents, staff);
  await ensureStaffOperations(staff);
  await ensureHolidays();

  const after = await currentReport();
  console.log(JSON.stringify({ mode: 'apply', changed: counts, before, after, credentials: { emails: staffSpecs.map((spec) => spec.email), password: 'Use the temporary SSPS_DEMO_STAFF_PASSWORD supplied during the first apply, then rotate it through the staff account workflow.' } }, null, 2));
}

run()
  .catch((error) => {
    console.error(error.stack || error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
