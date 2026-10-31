import process from "node:process";
import { PrismaClient } from "@prisma/client";
import {
  formatAdmissionRecordNumber,
  formatStudentAdmissionNumber,
  isStandardStudentAdmissionNumber,
} from "../src/lib/students/admissionNumbers.js";

const prisma = new PrismaClient();

function usage() {
  return [
    "Usage:",
    "  node --env-file=.env scripts/migrate-student-admission-numbers.mjs --check",
    "  node --env-file=.env scripts/migrate-student-admission-numbers.mjs --apply",
    "",
    "--check is read-only. --apply first validates the complete plan and then",
    "replaces every Student admission number in one database transaction.",
  ].join("\n");
}

function parseMode(argv) {
  const modes = argv.filter((entry) => entry === "--check" || entry === "--apply");
  if (modes.length !== 1 || argv.length !== 1) throw new Error(usage());
  return modes[0].slice(2);
}

function validYear(value, label) {
  const year = Number.parseInt(String(value), 10);
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`${label} does not have a valid academic year.`);
  }
  return year;
}

function uniqueTargets(records, label) {
  const seen = new Map();
  for (const record of records) {
    const prior = seen.get(record.target);
    if (prior) {
      throw new Error(`${label} would create a duplicate number ${record.target} for records ${prior} and ${record.id}. No changes were made.`);
    }
    seen.set(record.target, record.id);
  }
}

function temporaryNumber(kind, id, nonce) {
  return `TMP-${kind}-${nonce}-${id}`;
}

function buildPlan(students, admissions, applications) {
  const studentPlans = students.map((student) => ({
    id: student.id,
    old: student.admissionNumber,
    target: formatStudentAdmissionNumber(student.id, validYear(student.academicYear, `Student ${student.id}`)),
  }));
  uniqueTargets(studentPlans, "Student migration");

  const admissionPlans = [];
  const admissionsByApplicationId = new Map();
  const admissionsByStudentId = new Map();
  for (const admission of admissions) {
    const prior = admissionsByStudentId.get(admission.studentId) || 0;
    const ordinal = prior + 1;
    admissionsByStudentId.set(admission.studentId, ordinal);
    const student = students.find((candidate) => candidate.id === admission.studentId);
    if (!student) throw new Error(`Admission ${admission.id} references a missing student ${admission.studentId}.`);
    const academicYear = validYear(student.academicYear, `Student ${student.id}`);
    const target = formatAdmissionRecordNumber({
      studentId: admission.studentId,
      academicYear,
      admissionType: admission.admissionType,
      ordinal,
    });
    admissionPlans.push({ id: admission.id, old: admission.finalAdmissionNumber, target });
    if (admission.applicationId) admissionsByApplicationId.set(admission.applicationId, target);
  }
  uniqueTargets(admissionPlans, "Admission migration");

  const applicationPlans = applications.map((application) => {
    const target = admissionsByApplicationId.get(application.id);
    if (!target) {
      throw new Error(`Admission application ${application.id} has a finalized number but no linked Admission record. Repair it manually before migration.`);
    }
    return { id: application.id, old: application.finalAdmissionNumber, target };
  });
  uniqueTargets(applicationPlans, "Admission application migration");

  return { studentPlans, admissionPlans, applicationPlans };
}

async function loadPlan() {
  const [students, admissions, applications] = await Promise.all([
    prisma.student.findMany({
      select: { id: true, admissionNumber: true, academicYear: true },
      orderBy: { id: "asc" },
    }),
    prisma.admission.findMany({
      select: { id: true, studentId: true, admissionType: true, finalAdmissionNumber: true, applicationId: true },
      orderBy: [{ studentId: "asc" }, { createdAt: "asc" }, { id: "asc" }],
    }),
    prisma.admissionTestApplication.findMany({
      where: { finalAdmissionNumber: { not: null } },
      select: { id: true, finalAdmissionNumber: true },
      orderBy: { id: "asc" },
    }),
  ]);
  return buildPlan(students, admissions, applications);
}

function changed(records) {
  return records.filter((record) => record.old !== record.target);
}

function report(plan, mode) {
  const studentsChanging = changed(plan.studentPlans);
  const admissionsChanging = changed(plan.admissionPlans);
  const applicationsChanging = changed(plan.applicationPlans);
  console.log(JSON.stringify({
    mode,
    format: "SSPS-YYYY-000001",
    students: { total: plan.studentPlans.length, changing: studentsChanging.length },
    admissions: { total: plan.admissionPlans.length, changing: admissionsChanging.length },
    admissionApplications: { total: plan.applicationPlans.length, changing: applicationsChanging.length },
    sampleStudentChanges: studentsChanging.slice(0, 10),
  }, null, 2));
  return { studentsChanging, admissionsChanging, applicationsChanging };
}

async function applyPlan(plan) {
  const nonce = Date.now().toString(36);
  const studentChanges = changed(plan.studentPlans);
  const admissionChanges = changed(plan.admissionPlans);
  const applicationChanges = changed(plan.applicationPlans);

  await prisma.$transaction(async (tx) => {
    // Move every changing value out of the unique index first. This makes the
    // migration safe even if a target number already belongs to another row.
    for (const record of studentChanges) {
      await tx.student.update({
        where: { id: record.id },
        data: { admissionNumber: temporaryNumber("STU", record.id, nonce) },
      });
    }
    for (const record of admissionChanges) {
      await tx.admission.update({
        where: { id: record.id },
        data: { finalAdmissionNumber: temporaryNumber("ADM", record.id, nonce) },
      });
    }
    for (const record of applicationChanges) {
      await tx.admissionTestApplication.update({
        where: { id: record.id },
        data: { finalAdmissionNumber: temporaryNumber("APP", record.id, nonce) },
      });
    }

    for (const record of studentChanges) {
      await tx.student.update({ where: { id: record.id }, data: { admissionNumber: record.target } });
    }
    for (const record of admissionChanges) {
      await tx.admission.update({ where: { id: record.id }, data: { finalAdmissionNumber: record.target } });
    }
    for (const record of applicationChanges) {
      await tx.admissionTestApplication.update({ where: { id: record.id }, data: { finalAdmissionNumber: record.target } });
    }
  }, { maxWait: 10_000, timeout: 120_000 });
}

async function verify() {
  const students = await prisma.student.findMany({ select: { id: true, admissionNumber: true, academicYear: true } });
  const numbers = students.map((student) => student.admissionNumber);
  const invalid = students.filter((student) => !isStandardStudentAdmissionNumber(student.admissionNumber)
    || student.admissionNumber !== formatStudentAdmissionNumber(student.id, validYear(student.academicYear, `Student ${student.id}`)));
  if (numbers.some((number) => !number) || new Set(numbers).size !== numbers.length || invalid.length) {
    throw new Error(`Post-migration verification failed: ${invalid.length} invalid or mismatched student numbers.`);
  }
  return { studentsVerified: students.length, invalidStudentNumbers: invalid.length };
}

async function main() {
  const mode = parseMode(process.argv.slice(2));
  const plan = await loadPlan();
  const result = report(plan, mode);
  if (mode === "check") return;
  await applyPlan(plan);
  const verification = await verify();
  console.log(JSON.stringify({ applied: true, ...verification, changed: {
    students: result.studentsChanging.length,
    admissions: result.admissionsChanging.length,
    admissionApplications: result.applicationsChanging.length,
  } }, null, 2));
}

main()
  .catch((error) => {
    console.error(error.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
