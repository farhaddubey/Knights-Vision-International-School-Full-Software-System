import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { formatStudentAdmissionNumber } from '../src/lib/students/admissionNumbers.js';

const DEFAULT_FIREBASE_ENV = 'G:\\Sure Success Point School Next Firebase\\suresuccesswebapp\\.env.local';
const SCHOOL_SLUG = 'sure-success-point-school';
const BRANCH_CODE = 'SSPS-MAIN';
const BRANCH_SLUG = 'ssps-main';
const CLASS_SECTION = 'A';
const DEFAULT_SCHOOL_ADDRESS = 'Main Campus — address pending confirmation';

const CLASS_NAMES = [
  'LKG', 'UKG', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII',
  'IX', 'X', 'XS', 'XI', 'XII', 'XIIS',
];

const SOURCE_COLLECTIONS = new Map([
  ['Class_LKG', 'LKG'], ['Class_UKG', 'UKG'], ['Class_I', 'I'], ['Class_II', 'II'],
  ['Class_III', 'III'], ['Class_IV', 'IV'], ['Class_V', 'V'], ['Class_VI', 'VI'],
  ['Class_VII', 'VII'], ['Class_VIII', 'VIII'], ['Class_IX', 'IX'], ['Class_X', 'X'],
  ['Class_XS', 'XS'], ['Class_XI', 'XI'], ['Class_XII', 'XII'], ['Class_XIIS', 'XIIS'],
]);

// These old collections exist in the prior app, but the current data model has no
// equivalent class. A non-empty collection stops the import instead of misclassifying
// a child into LKG/UKG.
const UNSUPPORTED_COLLECTIONS = ['Class_KGI', 'Class_KGII'];

const prisma = new PrismaClient();

function usage() {
  return [
    'Usage:',
    '  node --env-file=.env scripts/migrate-firebase-students.mjs --check [options]',
    '  node --env-file=.env scripts/migrate-firebase-students.mjs --apply [options]',
    '',
    'Options:',
    '  --firebase-env <path>    Legacy Firebase .env.local path',
    '  --academic-year <year>   Target class/student academic year (default: current year)',
    '  --school-address <text>  School and main-campus address for first-time seeding',
  ].join('\n');
}

function parseArgs(argv) {
  const result = {
    mode: null,
    firebaseEnv: DEFAULT_FIREBASE_ENV,
    academicYear: new Date().getFullYear(),
    schoolAddress: DEFAULT_SCHOOL_ADDRESS,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--check' || argument === '--apply') {
      if (result.mode) throw new Error('Choose exactly one of --check or --apply.');
      result.mode = argument.slice(2);
      continue;
    }
    if (argument === '--firebase-env' || argument === '--academic-year' || argument === '--school-address') {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`Missing value for ${argument}.`);
      index += 1;
      if (argument === '--firebase-env') result.firebaseEnv = value;
      if (argument === '--school-address') result.schoolAddress = value.trim();
      if (argument === '--academic-year') result.academicYear = Number.parseInt(value, 10);
      continue;
    }
    if (argument === '--help' || argument === '-h') {
      console.log(usage());
      process.exit(0);
    }
    throw new Error(`Unknown option: ${argument}`);
  }

  if (!result.mode) throw new Error('Choose --check or --apply.');
  if (!Number.isInteger(result.academicYear) || result.academicYear < 2000 || result.academicYear > 2100) {
    throw new Error('Academic year must be a four-digit year between 2000 and 2100.');
  }
  if (!result.schoolAddress || result.schoolAddress.length > 255) {
    throw new Error('School address is required and must be 255 characters or fewer.');
  }
  return result;
}

function loadEnvFile(filePath) {
  let contents;
  try {
    contents = readFileSync(filePath, 'utf8');
  } catch {
    throw new Error('The legacy Firebase environment file could not be read. Pass --firebase-env with its valid .env.local path.');
  }

  const values = {};
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const separator = trimmed.indexOf('=');
    if (separator <= 0) continue;
    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    values[key] = value;
  }

  const projectId = values.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = values.NEXT_PUBLIC_FIREBASE_API_KEY;
  if (!projectId || !apiKey) {
    throw new Error('The legacy Firebase environment file is missing the public project ID or API key needed for its existing student read path.');
  }
  return { projectId, apiKey };
}

function decodeFirestoreValue(value) {
  if (!value || typeof value !== 'object') return null;
  if ('nullValue' in value) return null;
  if ('stringValue' in value) return value.stringValue;
  if ('booleanValue' in value) return value.booleanValue;
  if ('integerValue' in value) return value.integerValue;
  if ('doubleValue' in value) return value.doubleValue;
  if ('timestampValue' in value) return value.timestampValue;
  if ('referenceValue' in value) return value.referenceValue;
  if ('geoPointValue' in value) return value.geoPointValue;
  if ('bytesValue' in value) return value.bytesValue;
  if ('arrayValue' in value) return (value.arrayValue.values ?? []).map(decodeFirestoreValue);
  if ('mapValue' in value) {
    return Object.fromEntries(Object.entries(value.mapValue.fields ?? {}).map(([key, nestedValue]) => [key, decodeFirestoreValue(nestedValue)]));
  }
  return null;
}

function decodeFirestoreDocument(document) {
  return Object.fromEntries(Object.entries(document.fields ?? {}).map(([key, value]) => [key, decodeFirestoreValue(value)]));
}

async function fetchCollectionDocuments(firebase, collection) {
  const documents = [];
  let pageToken;
  do {
    const params = new URLSearchParams({ pageSize: '1000', key: firebase.apiKey });
    if (pageToken) params.set('pageToken', pageToken);
    const url = `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(firebase.projectId)}/databases/(default)/documents/${encodeURIComponent(collection)}?${params.toString()}`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Firebase student read failed for ${collection} (${response.status}). Check its project access configuration.`);
    }
    const payload = await response.json();
    documents.push(...(payload.documents ?? []));
    pageToken = payload.nextPageToken;
  } while (pageToken);
  return documents;
}

function hash(value, length = 24) {
  return createHash('sha256').update(value).digest('hex').slice(0, length);
}

function plainObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

function safeText(value) {
  if (value === null || value === undefined) return null;
  const text = String(value).replace(/\s+/g, ' ').trim();
  return text || null;
}

function textWithLimit(value, maximum, issues, fieldName) {
  const text = safeText(value);
  if (!text) return null;
  if (text.length > maximum) issues.fieldLength[fieldName] = (issues.fieldLength[fieldName] ?? 0) + 1;
  return text;
}

function parseDate(value) {
  const raw = safeText(value);
  if (!raw) return null;
  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/);
  const dmyMatch = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  let date;
  if (isoMatch) date = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00.000Z`);
  if (dmyMatch) date = new Date(`${dmyMatch[3]}-${dmyMatch[2].padStart(2, '0')}-${dmyMatch[1].padStart(2, '0')}T00:00:00.000Z`);
  if (!date || Number.isNaN(date.getTime())) return null;
  return date;
}

function numericValue(value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const text = safeText(value);
  if (!text || !/^-?\d+(?:\.\d+)?$/.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function splitName(fullName, issues) {
  const parts = (safeText(fullName) ?? '').split(' ').filter(Boolean);
  if (!parts.length) {
    issues.missingName += 1;
    return { firstName: null, middleName: null, lastName: null };
  }
  const firstName = textWithLimit(parts[0], 100, issues, 'firstName');
  const lastName = textWithLimit(parts.length > 1 ? parts.at(-1) : 'Unknown', 100, issues, 'lastName');
  const middleName = textWithLimit(parts.slice(1, -1).join(' '), 100, issues, 'middleName');
  return { firstName, middleName, lastName };
}

function isTransportRequired(value) {
  if (typeof value === 'boolean') return value;
  const text = safeText(value)?.toLowerCase();
  return ['yes', 'y', 'true', 'required', 'bus', 'transport'].includes(text);
}

function stripCredentials(value, issues) {
  if (Array.isArray(value)) return value.map((entry) => stripCredentials(entry, issues));
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.entries(value)
    .filter(([key]) => {
      const forbidden = /(password|passcode|token|secret|credential)/i.test(key);
      if (forbidden) issues.credentialKeysRemoved += 1;
      return !forbidden;
    })
    .map(([key, nestedValue]) => [key, stripCredentials(nestedValue, issues)]));
}

function compactObject(value) {
  return Object.fromEntries(Object.entries(value).filter(([, entry]) => entry !== null && entry !== undefined && entry !== ''));
}

function makeStudentRecord({ document, collection, className, academicYear, issues }) {
  const sourcePath = document.name?.split('/documents/')[1];
  if (!sourcePath || sourcePath.length > 200) {
    issues.invalidSourcePath += 1;
    return null;
  }
  const legacy = decodeFirestoreDocument(document);
  const basic = plainObject(legacy.basicInfo);
  const contact = plainObject(legacy.contactInfo);
  const academics = plainObject(legacy.academicInfo);
  const admission = plainObject(legacy.admissionSpecifics);
  const guardian = plainObject(legacy.guardianDetails);
  const health = plainObject(legacy.healthInfo);
  const transport = plainObject(legacy.transportDetails);
  const activities = plainObject(legacy.extracurricularActivities);
  const names = splitName(basic.fullName, issues);
  if (!names.firstName || !names.lastName) return null;

  const rawRoll = textWithLimit(basic.rollNo, 50, issues, 'rollNumber');
  const healthImmunization = compactObject({
    healthConditions: health.healthConditions ?? null,
    medicalHistory: health.medicalHistory ?? null,
    specialHealthRequirements: health.specialHealthRequirements ?? null,
    vaccinationStatus: health.vaccinationStatus ?? null,
  });

  return {
    sourcePath,
    collection,
    className,
    rawRoll,
    sourceData: stripCredentials(legacy, issues),
    student: {
      rollNumber: rawRoll,
      govt_studentId: textWithLimit(admission.studentId, 20, issues, 'govtStudentId'),
      aadhaarNumber: textWithLimit(basic.uidNo, 20, issues, 'aadhaarNumber'),
      academicYear,
      firstName: names.firstName,
      middleName: names.middleName,
      lastName: names.lastName,
      gender: textWithLimit(basic.gender, 20, issues, 'gender'),
      dateOfBirth: parseDate(basic.dob),
      admissionDate: parseDate(admission.admissionDate),
      guardianContact: textWithLimit(contact.guardianContact ?? guardian.guardianPhone, 100, issues, 'guardianContact'),
      bloodGroup: textWithLimit(health.bloodGroup, 10, issues, 'bloodGroup'),
      nationality: textWithLimit(basic.nationality, 50, issues, 'nationality'),
      religion: textWithLimit(basic.religion, 50, issues, 'religion'),
      profileImageUrl: textWithLimit(basic.photoURL, 300, issues, 'profileImageUrl'),
      hobbies: textWithLimit(activities.hobbies, 200, issues, 'hobbies'),
      specialTalents: textWithLimit(activities.achievements, 200, issues, 'specialTalents'),
      guardianName: textWithLimit(contact.guardianName, 100, issues, 'guardianName'),
      guardianRelation: textWithLimit(guardian.guardianRelationship, 50, issues, 'guardianRelation'),
      guardianAddress: textWithLimit(contact.correspondenceAddress ?? contact.permanentAddress, 300, issues, 'guardianAddress'),
      emergencyContact: textWithLimit(contact.emergencyContact, 20, issues, 'emergencyContact'),
      residentialAddress: textWithLimit(contact.permanentAddress ?? contact.correspondenceAddress, 300, issues, 'residentialAddress'),
      isTransportRequired: isTransportRequired(transport.transportPreference),
      previousSchoolName: textWithLimit(academics.previousSchool, 150, issues, 'previousSchoolName'),
      lastExamPassed: textWithLimit(academics.lastAttendedGrade, 100, issues, 'lastExamPassed'),
      lastExamResult: numericValue(academics.academicPerformance),
      healthImmunization: Object.keys(healthImmunization).length ? healthImmunization : null,
    },
  };
}

function resolveRollNumbers(records, issues) {
  const byClassAndRoll = new Map();
  for (const record of records) {
    const baseRoll = record.rawRoll ?? `FB-${hash(record.sourcePath, 10)}`;
    const key = `${record.className}\u0000${baseRoll}`;
    const grouped = byClassAndRoll.get(key) ?? [];
    grouped.push(record);
    byClassAndRoll.set(key, grouped);
  }

  for (const recordsWithSameRoll of byClassAndRoll.values()) {
    recordsWithSameRoll.sort((first, second) => first.sourcePath.localeCompare(second.sourcePath));
    recordsWithSameRoll.forEach((record, index) => {
      const baseRoll = record.rawRoll ?? `FB-${hash(record.sourcePath, 10)}`;
      record.student.rollNumber = index === 0
        ? baseRoll
        : `${baseRoll.slice(0, 40)}-FB-${hash(record.sourcePath, 6)}`;
      if (index > 0) issues.duplicateRollResolved += 1;
    });
  }
}

async function loadLegacyStudents(firebase, academicYear) {
  const issues = {
    missingName: 0,
    invalidSourcePath: 0,
    duplicateRollResolved: 0,
    credentialKeysRemoved: 0,
    unsupportedLegacyStudents: 0,
    fieldLength: {},
  };
  const byCollection = {};
  const sourceDocuments = await Promise.all([...SOURCE_COLLECTIONS.entries()].map(async ([collection, className]) => {
    const documents = await fetchCollectionDocuments(firebase, collection);
    byCollection[collection] = documents.length;
    return documents.map((document) => makeStudentRecord({ document, collection, className, academicYear, issues })).filter(Boolean);
  }));

  const unsupported = await Promise.all(UNSUPPORTED_COLLECTIONS.map(async (collection) => {
    const documents = await fetchCollectionDocuments(firebase, collection);
    byCollection[collection] = documents.length;
    return documents.length;
  }));
  issues.unsupportedLegacyStudents = unsupported.reduce((total, count) => total + count, 0);

  const records = sourceDocuments.flat();
  resolveRollNumbers(records, issues);
  return { records, byCollection, issues };
}

function hasBlockingIssues(issues) {
  return issues.missingName > 0
    || issues.invalidSourcePath > 0
    || issues.unsupportedLegacyStudents > 0
    || Object.values(issues.fieldLength).some((count) => count > 0);
}

async function targetCounts() {
  const [schools, branches, classes, students, importedStudents] = await Promise.all([
    prisma.school.count(),
    prisma.schoolBranch.count(),
    prisma.schoolClass.count(),
    prisma.student.count(),
    prisma.studentLegacyFirebaseRecord.count(),
  ]);
  return { schools, branches, classes, students, importedStudents };
}

async function ensureBaseline({ academicYear, schoolAddress }) {
  const school = await prisma.school.upsert({
    where: { slug: SCHOOL_SLUG },
    update: {},
    create: {
      name: 'Sure Success Point School',
      slug: SCHOOL_SLUG,
      address: schoolAddress,
      languagesSpoken: ['English'],
      specializations: [],
      mostPopularServices: [],
    },
  });
  const branch = await prisma.schoolBranch.upsert({
    where: { code: BRANCH_CODE },
    update: {},
    create: {
      schoolId: school.id,
      name: 'Main Campus',
      code: BRANCH_CODE,
      slug: BRANCH_SLUG,
      address: schoolAddress,
    },
  });
  if (branch.schoolId !== school.id) {
    throw new Error('The existing SSPS-MAIN branch belongs to a different school. Migration stopped without importing students.');
  }

  const classes = await Promise.all(CLASS_NAMES.map((name) => prisma.schoolClass.upsert({
    where: { branchId_name_section_academicYear: { branchId: branch.id, name, section: CLASS_SECTION, academicYear } },
    update: {},
    create: { schoolId: school.id, branchId: branch.id, name, section: CLASS_SECTION, academicYear },
  })));
  return { school, branch, classByName: new Map(classes.map((schoolClass) => [schoolClass.name, schoolClass])) };
}

async function applyImport(records, baseline) {
  const existingRecords = await prisma.studentLegacyFirebaseRecord.findMany({
    where: { sourcePath: { in: records.map((record) => record.sourcePath) } },
    select: { sourcePath: true, studentId: true },
  });
  const existingBySourcePath = new Map(existingRecords.map((record) => [record.sourcePath, record]));
  let created = 0;
  let updated = 0;
  const batchSize = 20;

  for (let start = 0; start < records.length; start += batchSize) {
    const batch = records.slice(start, start + batchSize);
    for (const record of batch) {
      const schoolClass = baseline.classByName.get(record.className);
      if (!schoolClass) throw new Error(`No target class was seeded for ${record.className}.`);
      const data = { ...record.student, schoolId: baseline.school.id, branchId: baseline.branch.id, classId: schoolClass.id };
      const existing = existingBySourcePath.get(record.sourcePath);
      if (existing) {
        updated += 1;
        await prisma.$transaction([
          prisma.student.update({ where: { id: existing.studentId }, data }),
          prisma.studentLegacyFirebaseRecord.update({ where: { sourcePath: record.sourcePath }, data: { sourceData: record.sourceData } }),
        ], { maxWait: 10_000, timeout: 60_000 });
        continue;
      }
      created += 1;
      await prisma.$transaction(async (tx) => {
        const student = await tx.student.create({
          data: {
            ...data,
            // Set after the immutable database ID has been allocated.
            admissionNumber: null,
            legacyFirebaseRecord: { create: { sourcePath: record.sourcePath, sourceData: record.sourceData } },
          },
        });
        await tx.student.update({
          where: { id: student.id },
          data: { admissionNumber: formatStudentAdmissionNumber(student.id, student.academicYear) },
        });
      }, { maxWait: 10_000, timeout: 60_000 });
    }
  }
  return { created, updated };
}

function studentsByClass(records) {
  return Object.fromEntries(CLASS_NAMES.map((className) => [className, records.filter((record) => record.className === className).length]));
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const firebase = loadEnvFile(options.firebaseEnv);
  const legacy = await loadLegacyStudents(firebase, options.academicYear);
  const before = await targetCounts();
  const summary = {
    mode: options.mode,
    academicYear: options.academicYear,
    legacyStudentsFound: legacy.records.length,
    studentsByClass: studentsByClass(legacy.records),
    sourceCollections: legacy.byCollection,
    requestedBaselineClasses: CLASS_NAMES.length,
    duplicateRollNumbersResolved: legacy.issues.duplicateRollResolved,
    credentialLikeKeysExcluded: legacy.issues.credentialKeysRemoved,
    issues: {
      missingName: legacy.issues.missingName,
      invalidSourcePath: legacy.issues.invalidSourcePath,
      unsupportedLegacyStudents: legacy.issues.unsupportedLegacyStudents,
      fieldLength: legacy.issues.fieldLength,
    },
    targetBefore: before,
  };

  if (hasBlockingIssues(legacy.issues)) {
    console.log(JSON.stringify({ status: 'blocked', ...summary }, null, 2));
    process.exitCode = 1;
    return;
  }

  if (options.mode === 'check') {
    console.log(JSON.stringify({ status: 'ready', ...summary }, null, 2));
    return;
  }

  const baseline = await ensureBaseline(options);
  const result = await applyImport(legacy.records, baseline);
  const after = await targetCounts();
  console.log(JSON.stringify({
    status: 'applied',
    ...summary,
    imported: result,
    targetAfter: after,
  }, null, 2));
}

main()
  .catch((error) => {
    console.error(JSON.stringify({
      status: 'failed',
      message: error instanceof Error ? error.message : 'Unknown migration error.',
    }));
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
