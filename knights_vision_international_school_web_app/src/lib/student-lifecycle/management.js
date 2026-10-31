import { randomBytes, randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  hasPermission,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";
import { assertCollectionOfficer } from "@/src/lib/finance/provisionalCollections";
import {
  formatAdmissionRecordNumber,
  formatStudentAdmissionNumber,
} from "@/src/lib/students/admissionNumbers";

export const CLASS_NAMES = new Set([
  "LKG", "UKG", "I", "II", "III", "IV", "V", "VI", "VII", "VIII",
  "IX", "X", "XS", "XI", "XII", "XIIS", "XIII", "XIIIJ",
]);

export const TRANSFER_REASONS = new Set([
  "FAMILY_RELOCATION",
  "FINANCIAL_DIFFICULTIES",
  "ACADEMIC_CONCERNS",
  "STUDENT_BEHAVIOUR",
  "BULLYING_OR_SAFETY",
  "TEACHER_OR_STAFF_COMPLAINT",
  "SCHOOL_MANAGEMENT_CONCERN",
  "PERSONAL_REASONS",
  "OTHER",
]);

const PAYMENT_METHODS = new Set(["CASH", "UPI", "NET_BANKING", "ONLINE_GATEWAY"]);
const STUDENT_CATEGORIES = new Set(["KSAT_SUPPORT_PLUS", "KSAT_SUPPORT", "KSAT_STANDARD", "KSAT_GENERAL", "DIRECT_GENERAL"]);

export function lifecycleErrorResponse(error, fallback = "Unable to complete the student lifecycle operation.") {
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return Response.json({ error: error.message }, { status: error.status || 401 });
  }
  if (error?.code === "P2002") {
    return Response.json({ error: "A matching lifecycle record already exists." }, { status: 409 });
  }
  if (error?.code === "P2003") {
    return Response.json({ error: "A related school record is missing or cannot be changed." }, { status: 409 });
  }
  console.error("[Student lifecycle]", error);
  return Response.json({ error: fallback }, { status: 500 });
}

export async function requireLifecyclePermission(request, permission, fallbackPermission = null) {
  const authorization = await requirePanelPermission(request, permission);
  if (fallbackPermission && !hasPermission(authorization, fallbackPermission)) {
    throw new PanelAuthorizationError(403, "Your role is not authorised for this student lifecycle operation.");
  }
  return authorization;
}

export function positiveInteger(value, field = "id") {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new PanelAuthorizationError(400, `${field} must be a valid positive number.`);
  }
  return parsed;
}

export function academicYear(value) {
  const parsed = Number.parseInt(String(value ?? new Date().getFullYear()), 10);
  if (!Number.isInteger(parsed) || parsed < 2000 || parsed > 2100) {
    throw new PanelAuthorizationError(400, "academicYear must be between 2000 and 2100.");
  }
  return parsed;
}

export function text(value, field, { required = false, max = 300 } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new PanelAuthorizationError(400, `${field} must be text.`);
  const result = value.trim();
  if (!result && required) throw new PanelAuthorizationError(400, `${field} is required.`);
  if (result.length > max) throw new PanelAuthorizationError(400, `${field} is too long.`);
  return result || null;
}

export function lifecycleDate(value, field, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new PanelAuthorizationError(400, `${field} must be a valid date.`);
  return date;
}

export function money(value, field, { required = false, max = 10_000_000 } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0 || amount > max) {
    throw new PanelAuthorizationError(400, `${field} is invalid.`);
  }
  return Math.round(amount * 100) / 100;
}

export function scopeOf(record) {
  return {
    scopeType: "CLASS",
    schoolId: record.schoolId,
    branchId: record.branchId,
    classId: record.classId,
  };
}

export function assertLifecycleScope(authorization, record, message = "You do not have access to this school, branch, or class.") {
  if (!hasScopeAccess(authorization, record)) throw new PanelAuthorizationError(403, message);
}

export async function classScope(classId, authorization) {
  const id = positiveInteger(classId, "classId");
  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id },
    select: { id: true, schoolId: true, branchId: true, name: true, section: true, academicYear: true },
  });
  if (!schoolClass) throw new PanelAuthorizationError(404, "Class not found.");
  assertLifecycleScope(authorization, schoolClass);
  return schoolClass;
}

export async function feeSchemeForLifecycle(feeSchemeId, schoolClass) {
  const id = positiveInteger(feeSchemeId, "feeSchemeId");
  const scheme = await prisma.feeScheme.findUnique({ where: { id } });
  if (!scheme || scheme.classId !== schoolClass.id) {
    throw new PanelAuthorizationError(400, "The selected fee scheme does not belong to the selected class.");
  }
  return scheme;
}

async function generatedTcNumber() {
  const year = new Date().getFullYear();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const value = `SSPS-TC-${year}-${randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
    const existing = await prisma.transferCertificateRequest.findUnique({ where: { tcNumber: value }, select: { id: true } });
    if (!existing) return value;
  }
  throw new PanelAuthorizationError(503, "Could not reserve a TC number. Please retry.");
}

function boolean(value, field, defaultValue = false) {
  if (value == null) return defaultValue;
  if (typeof value !== "boolean") throw new PanelAuthorizationError(400, `${field} must be true or false.`);
  return value;
}

function optionalProfileData(input, scope, { creating = false } = {}) {
  const value = input?.student && typeof input.student === "object" ? input.student : input || {};
  const result = {};
  const stringFields = [
    ["middleName", 100], ["rollNumber", 50], ["gender", 20], ["guardianContact", 100], ["bloodGroup", 10], ["nationality", 50], ["religion", 50], ["casteCategory", 50],
    ["dreamOrAim", 200], ["hobbies", 200], ["specialTalents", 200], ["fatherName", 100], ["fatherContact", 20],
    ["fatherEmail", 100], ["fatherProfession", 100], ["fatherQualification", 100], ["motherName", 100], ["motherContact", 20], ["motherEmail", 100],
    ["motherProfession", 100], ["motherQualification", 100], ["guardianName", 100], ["guardianRelation", 50], ["guardianAddress", 300],
    ["emergencyContact", 20], ["residentialAddress", 300], ["city", 100], ["state", 100], ["pinCode", 10], ["preferredLanguage", 50],
    ["previousSchoolName", 150], ["lastExamPassed", 100], ["reasonOfTransfer", 300], ["previousSchoolMedium", 50], ["previousSchoolBoard", 50], ["previousSchoolCity", 100],
  ];
  for (const [field, max] of stringFields) {
    if (creating || Object.prototype.hasOwnProperty.call(value, field)) result[field] = text(value[field], field, { max });
  }
  // A photo can only be set through the dedicated authenticated upload route.
  // It writes a controlled Backblaze object and prevents untrusted external
  // image URLs from being embedded into results, admit cards, or ID cards.
  if (creating) {
    result.profileImageUrl = text(value.profileImageUrl, "profileImageUrl", { max: 300 });
  } else if (Object.prototype.hasOwnProperty.call(value, "profileImageUrl")) {
    throw new PanelAuthorizationError(400, "Use the secure student photo upload control to change the profile image.");
  }
  for (const [field, max] of [["fatherIncome", 10_000_000], ["motherIncome", 10_000_000], ["lastExamResult", 100], ["previousAdmissionFee", 10_000_000], ["previousMonthlyFee", 10_000_000]]) {
    if (creating || Object.prototype.hasOwnProperty.call(value, field)) result[field] = money(value[field], field, { max });
  }
  if (creating || Object.prototype.hasOwnProperty.call(value, "dateOfBirth")) result.dateOfBirth = lifecycleDate(value.dateOfBirth, "dateOfBirth");
  if (creating || Object.prototype.hasOwnProperty.call(value, "isTransportRequired")) result.isTransportRequired = boolean(value.isTransportRequired, "isTransportRequired");
  if (creating || Object.prototype.hasOwnProperty.call(value, "isScholarshipHolder")) result.isScholarshipHolder = boolean(value.isScholarshipHolder, "isScholarshipHolder");
  if (creating || Object.prototype.hasOwnProperty.call(value, "healthImmunization")) {
    if (value.healthImmunization != null && (typeof value.healthImmunization !== "object" || Array.isArray(value.healthImmunization))) {
      throw new PanelAuthorizationError(400, "healthImmunization must be an object.");
    }
    result.healthImmunization = value.healthImmunization || null;
  }
  if (creating) {
    result.firstName = text(value.firstName, "firstName", { required: true, max: 100 });
    result.lastName = text(value.lastName, "lastName", { required: true, max: 100 });
    const category = String(value.studentCategory || "DIRECT_GENERAL").toUpperCase();
    if (!STUDENT_CATEGORIES.has(category)) throw new PanelAuthorizationError(400, "studentCategory is invalid.");
    result.studentCategory = category;
    result.schoolId = scope.schoolId;
    result.branchId = scope.branchId;
    result.classId = scope.id;
  } else {
    if (Object.prototype.hasOwnProperty.call(value, "firstName")) result.firstName = text(value.firstName, "firstName", { required: true, max: 100 });
    if (Object.prototype.hasOwnProperty.call(value, "lastName")) result.lastName = text(value.lastName, "lastName", { required: true, max: 100 });
  }
  return result;
}

function provisionalInput(input, configuredAmount, kind) {
  const collectedAmount = money(input?.collectedAmount, "collectedAmount", { max: configuredAmount });
  if (!collectedAmount) return null;
  if (collectedAmount > configuredAmount + 0.00001) {
    throw new PanelAuthorizationError(400, "The collected amount cannot exceed the configured fee.");
  }
  const method = String(input?.paymentMethod || "").trim().toUpperCase();
  if (!PAYMENT_METHODS.has(method)) throw new PanelAuthorizationError(400, "A valid paymentMethod is required when money is collected.");
  const transactionId = text(input?.transactionId, "transactionId", { max: 100 });
  if (method !== "CASH" && !transactionId) throw new PanelAuthorizationError(400, "A transaction reference is required for non-cash collection.");
  return {
    paymentKind: kind,
    amount: collectedAmount,
    method,
    transactionId,
    submittedRemarks: text(input?.paymentRemarks, "paymentRemarks", { max: 300 }),
    idempotencyKey: text(input?.idempotencyKey, "idempotencyKey", { max: 100 }) || `lifecycle-${randomUUID()}`,
  };
}

export async function createAdmission(authorization, body) {
  const scope = await classScope(body?.classId, authorization);
  const scheme = await feeSchemeForLifecycle(body?.feeSchemeId, scope);
  // Academic session belongs to the selected class. Never allow the browser
  // to create a student identifier for a different year than that class.
  const year = scope.academicYear;
  const admissionDate = lifecycleDate(body?.admissionDate, "admissionDate") || new Date();
  const profile = optionalProfileData(body, scope, { creating: true });
  const collectionInput = provisionalInput(body, scheme.admissionFee, "NEW_ADMISSION");
  // An admission is not opened on a promise to pay. The guardian payment is
  // recorded in the same transaction as the admission and receives an
  // acknowledgement immediately. It remains a custody record until COEF and
  // Central Administration complete their separate controls.
  if (!collectionInput) {
    throw new PanelAuthorizationError(400, "The configured admission fee must be collected before a new admission can be created.");
  }
  if (Math.abs(collectionInput.amount - scheme.admissionFee) > 0.00001) {
    throw new PanelAuthorizationError(400, "The full configured admission fee must be collected before a new admission can be created.");
  }
  if (!hasPermission(authorization, "fee.collect.provisional")) {
    throw new PanelAuthorizationError(403, "Your role is not authorised to record the mandatory guardian admission payment.");
  }
  assertCollectionOfficer(authorization);
  // A new student receives a single-use digital-access code as part of the
  // controlled admission transaction. Only its bcrypt hash is retained.
  const activationCode = randomBytes(12).toString("base64url");
  const activationExpiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000));

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.student.findFirst({
      where: {
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        firstName: { equals: profile.firstName, mode: "insensitive" },
        lastName: { equals: profile.lastName, mode: "insensitive" },
        dateOfBirth: profile.dateOfBirth || undefined,
        status: { not: "TRANSFERRED" },
      },
      select: { id: true, admissionNumber: true },
    });
    if (duplicate) throw new PanelAuthorizationError(409, `A matching active student record already exists (${duplicate.admissionNumber || `ID ${duplicate.id}`}).`);

    const createdStudent = await tx.student.create({
      data: {
        ...profile,
        // The permanent number is derived from this committed immutable ID
        // immediately below. This prevents concurrent admissions from ever
        // competing for a random or manually supplied number.
        admissionNumber: null,
        rollNumber: text(body?.rollNumber, "rollNumber", { max: 50 }) || null,
        admissionDate,
        academicYear: year,
        admittedViaTest: boolean(body?.admittedViaTest, "admittedViaTest"),
        enrollmentMode: text(body?.enrollmentMode, "enrollmentMode", { max: 50 }) || "DIRECT",
        feeSchemeId: scheme.id,
        status: "ACTIVE",
        loginActivationCodeHash: await bcrypt.hash(activationCode, 12),
        loginActivationExpiresAt: activationExpiresAt,
        loginActivatedAt: null,
      },
    });
    const admissionNumber = formatStudentAdmissionNumber(createdStudent.id, year);
    const student = await tx.student.update({
      where: { id: createdStudent.id },
      data: { admissionNumber },
    });
    const admission = await tx.admission.create({
      data: {
        studentId: student.id,
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        classId: scope.id,
        admissionType: body?.admittedViaTest === true ? "FRESH" : "DIRECT",
        admissionDate,
        status: "PENDING",
        feeSchemeId: scheme.id,
        finalAdmissionNumber: admissionNumber,
      },
    });
    const enrollment = await tx.studentEnrollment.create({
      data: {
        studentId: student.id,
        admissionId: admission.id,
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        classId: scope.id,
        academicYear: year,
        decision: "NEW_ADMISSION",
        status: "PENDING_PAYMENT",
        note: text(body?.enrollmentNote, "enrollmentNote", { max: 500 }),
        createdById: authorization.user.id,
      },
    });
    const collection = await tx.provisionalFeeCollection.create({
      data: {
        ...collectionInput,
        admissionId: admission.id,
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        classId: scope.id,
        collectorUserId: authorization.user.id,
      },
    });
    await tx.student.update({ where: { id: student.id }, data: { finalAdmissionId: admission.id } });
    await tx.accessAuditLog.create({
      data: {
        actorUserId: authorization.user.id,
        action: "student.account.activation_issued",
        resource: "Student",
        resourceId: String(student.id),
        scopeType: "CLASS",
        schoolId: scope.schoolId,
        branchId: scope.branchId,
        classId: scope.id,
        metadata: { source: "new_admission", expiresAt: activationExpiresAt.toISOString() },
      },
    });
    return {
      student,
      admission,
      enrollment,
      collection,
      scope: scopeOf(scope),
      configuredFee: scheme.admissionFee,
      accountActivation: { activationCode, expiresAt: activationExpiresAt },
    };
  });
}

export async function createReadmission(authorization, body) {
  const studentId = positiveInteger(body?.studentId, "studentId");
  const targetScope = await classScope(body?.classId, authorization);
  const scheme = await feeSchemeForLifecycle(body?.feeSchemeId, targetScope);
  const year = targetScope.academicYear;
  const decision = String(body?.decision || "PROMOTED").toUpperCase();
  if (!new Set(["PROMOTED", "REPEATED", "RETURNING"]).has(decision)) throw new PanelAuthorizationError(400, "decision must be PROMOTED, REPEATED, or RETURNING.");
  const admissionDate = lifecycleDate(body?.admissionDate, "admissionDate") || new Date();
  const collectionInput = provisionalInput(body, scheme.readmissionFee, "READMISSION");
  if (collectionInput) {
    if (!hasPermission(authorization, "fee.collect.provisional")) {
      throw new PanelAuthorizationError(403, "Your role is not authorised to record a guardian payment.");
    }
    assertCollectionOfficer(authorization);
  }

  return prisma.$transaction(async (tx) => {
    const student = await tx.student.findUnique({ where: { id: studentId } });
    if (!student) throw new PanelAuthorizationError(404, "Student not found.");
    assertLifecycleScope(authorization, student);
    if (student.status === "TRANSFERRED") throw new PanelAuthorizationError(409, "A transferred student must be restored through an authorised returning-student process.");
    const existing = await tx.studentEnrollment.findUnique({ where: { studentId_academicYear: { studentId, academicYear: year } } });
    if (existing) throw new PanelAuthorizationError(409, "This student already has an enrollment for the selected academic session.");

    const admission = await tx.admission.create({
      data: {
        studentId,
        schoolId: targetScope.schoolId,
        branchId: targetScope.branchId,
        classId: targetScope.id,
        admissionType: "READMISSION",
        admissionDate,
        status: "PENDING",
        previousClassId: student.classId,
        feeSchemeId: scheme.id,
        finalAdmissionNumber: formatAdmissionRecordNumber({
          studentId: student.id,
          academicYear: year,
          admissionType: "READMISSION",
        }),
      },
    });
    const enrollment = await tx.studentEnrollment.create({
      data: {
        studentId,
        admissionId: admission.id,
        schoolId: targetScope.schoolId,
        branchId: targetScope.branchId,
        classId: targetScope.id,
        academicYear: year,
        decision,
        status: "PENDING_PAYMENT",
        note: text(body?.enrollmentNote, "enrollmentNote", { max: 500 }),
        createdById: authorization.user.id,
      },
    });
    const collection = collectionInput
      ? await tx.provisionalFeeCollection.create({
        data: {
          ...collectionInput,
          admissionId: admission.id,
          schoolId: targetScope.schoolId,
          branchId: targetScope.branchId,
          classId: targetScope.id,
          collectorUserId: authorization.user.id,
        },
      })
      : null;
    return { student, admission, enrollment, collection, scope: scopeOf(targetScope), configuredFee: scheme.readmissionFee };
  });
}

export async function studentByIdWithScope(id, authorization) {
  const student = await prisma.student.findUnique({
    where: { id: positiveInteger(id, "studentId") },
    select: {
      id: true,
      admissionNumber: true,
      rollNumber: true,
      firstName: true,
      middleName: true,
      lastName: true,
      gender: true,
      dateOfBirth: true,
      admissionDate: true,
      status: true,
      schoolId: true,
      branchId: true,
      classId: true,
      academicYear: true,
      studentCategory: true,
      enrollmentMode: true,
      admittedViaTest: true,
      isScholarshipHolder: true,
      isTransportRequired: true,
      guardianContact: true,
      bloodGroup: true,
      nationality: true,
      religion: true,
      casteCategory: true,
      profileImageUrl: true,
      dreamOrAim: true,
      hobbies: true,
      specialTalents: true,
      fatherName: true,
      fatherContact: true,
      fatherEmail: true,
      fatherProfession: true,
      fatherQualification: true,
      fatherIncome: true,
      motherName: true,
      motherContact: true,
      motherEmail: true,
      motherProfession: true,
      motherQualification: true,
      motherIncome: true,
      guardianName: true,
      guardianRelation: true,
      guardianAddress: true,
      emergencyContact: true,
      residentialAddress: true,
      city: true,
      state: true,
      pinCode: true,
      preferredLanguage: true,
      previousSchoolName: true,
      lastExamPassed: true,
      lastExamResult: true,
      previousAdmissionFee: true,
      previousMonthlyFee: true,
      reasonOfTransfer: true,
      previousSchoolMedium: true,
      previousSchoolBoard: true,
      previousSchoolCity: true,
      healthImmunization: true,
      class: { select: { id: true, name: true, section: true } },
      feeScheme: { select: { id: true, category: true, admissionFee: true, readmissionFee: true, monthlyFee: true } },
      admissions: { orderBy: { createdAt: "desc" }, include: { AdmissionFeeTransaction: { orderBy: { paymentDate: "desc" } } } },
      enrollments: { orderBy: [{ academicYear: "desc" }, { createdAt: "desc" }] },
      transferCertificateRequests: { orderBy: { createdAt: "desc" }, include: { feedback: { orderBy: { createdAt: "desc" } } } },
      MonthlyFee: { orderBy: [{ year: "desc" }, { month: "desc" }], take: 24, include: { MonthlyFeePayments: { orderBy: { paymentDate: "desc" } } } },
    },
  });
  if (!student) throw new PanelAuthorizationError(404, "Student not found.");
  assertLifecycleScope(authorization, student);
  return student;
}

export async function updateStudentProfile(id, authorization, body) {
  const student = await studentByIdWithScope(id, authorization);
  if (!student.profileImageUrl) {
    throw new PanelAuthorizationError(400, "A student photo is required before the profile can be saved. Upload the photo from the profile editor first.");
  }
  const currentScope = { id: student.classId, schoolId: student.schoolId, branchId: student.branchId };
  const data = optionalProfileData(body, currentScope);
  if (!Object.keys(data).length) throw new PanelAuthorizationError(400, "No editable student profile fields were supplied.");
  const updated = await prisma.student.update({ where: { id: student.id }, data });
  return { student, updated, scope: scopeOf(updated) };
}

export async function markStudentLeft(id, authorization, body) {
  const student = await studentByIdWithScope(id, authorization);
  const leavingDate = lifecycleDate(body?.leavingDate, "leavingDate", { required: true });
  const note = text(body?.note, "note", { required: true, max: 500 });
  const result = await prisma.$transaction(async (tx) => {
    await tx.student.update({ where: { id: student.id }, data: { status: "INACTIVE" } });
    await tx.studentEnrollment.updateMany({
      where: { studentId: student.id, status: { in: ["PENDING_PAYMENT", "ACTIVE"] } },
      data: { status: "LEFT", leavingDate, completedAt: new Date(), note },
    });
    return tx.student.findUnique({ where: { id: student.id } });
  });
  return { student, updated: result, scope: scopeOf(student) };
}

export async function financialSnapshot(studentId, academicYearValue) {
  const [fees, provisional] = await Promise.all([
    prisma.monthlyFee.findMany({ where: { studentId, academicYear: academicYearValue }, select: { totalDue: true, paidAmount: true, waivedAmount: true, fineAmount: true, status: true } }),
    prisma.provisionalFeeCollection.aggregate({
      where: { admission: { studentId }, status: { in: ["PENDING_HANDOVER", "HANDED_OVER", "PENDING_VERIFICATION", "COEF_APPROVED", "BANK_SUBMITTED"] } },
      _sum: { amount: true },
    }),
  ]);
  const amountDue = (fee) => Number(fee.totalDue || 0) + Number(fee.fineAmount || 0);
  const amountPaid = (fee) => Number(fee.paidAmount || 0);
  const amountWaived = (fee) => Number(fee.waivedAmount || 0);
  const summarise = (rows) => {
    const totalApplicable = rows.reduce((sum, fee) => sum + amountDue(fee), 0);
    const verifiedPayments = rows.reduce((sum, fee) => sum + amountPaid(fee), 0);
    const waived = rows.reduce((sum, fee) => sum + amountWaived(fee), 0);
    return {
      totalApplicable,
      verifiedPayments,
      waived,
      outstandingBalance: Math.max(0, totalApplicable - verifiedPayments - waived),
    };
  };
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const yearly = summarise(fees);
  const currentMonthRows = fees.filter((fee) => fee.month === currentMonth && fee.year === currentYear);
  return {
    academicYear: academicYearValue,
    ...yearly,
    currentMonth: {
      month: currentMonth,
      year: currentYear,
      hasFeeRecord: currentMonthRows.length > 0,
      ...summarise(currentMonthRows),
    },
    pendingCollections: provisional._sum.amount || 0,
  };
}

export async function createTcRequest(authorization, body) {
  const student = await studentByIdWithScope(body?.studentId, authorization);
  const reason = String(body?.reason || "").trim().toUpperCase();
  if (!TRANSFER_REASONS.has(reason)) throw new PanelAuthorizationError(400, "A valid transfer reason is required.");
  const requestedTransferDate = lifecycleDate(body?.requestedTransferDate, "requestedTransferDate", { required: true });
  const year = academicYear(body?.academicYear || student.academicYear);

  const duplicate = await prisma.transferCertificateRequest.findFirst({
    where: {
      studentId: student.id,
      status: { in: ["REQUESTED", "RETURNED_FOR_CLARIFICATION", "PRINCIPAL_APPROVED", "FINANCE_CLEARED", "FINANCE_PENDING_RECONCILIATION"] },
    },
    select: { publicId: true },
  });
  if (duplicate) throw new PanelAuthorizationError(409, `An active TC request already exists (${duplicate.publicId}).`);

  const request = await prisma.$transaction(async (tx) => {
    const created = await tx.transferCertificateRequest.create({
      data: {
        studentId: student.id,
        schoolId: student.schoolId,
        branchId: student.branchId,
        classId: student.classId,
        academicYear: year,
        requestedTransferDate,
        destinationSchoolName: text(body?.destinationSchoolName, "destinationSchoolName", { max: 160 }),
        destinationLocation: text(body?.destinationLocation, "destinationLocation", { max: 160 }),
        reason,
        guardianRemarks: text(body?.guardianRemarks, "guardianRemarks", { max: 5_000 }),
        staffRemarks: text(body?.staffRemarks, "staffRemarks", { max: 5_000 }),
        sensitiveDetails: text(body?.sensitiveDetails, "sensitiveDetails", { max: 5_000 }),
        requestedById: authorization.user.id,
      },
    });
    await tx.studentEnrollment.updateMany({
      where: { studentId: student.id, status: { in: ["PENDING_PAYMENT", "ACTIVE"] } },
      data: { status: "TRANSFER_REQUESTED" },
    });
    return created;
  });
  return { request, student, scope: scopeOf(student) };
}

export async function tcRequestById(id, authorization) {
  const request = await prisma.transferCertificateRequest.findUnique({
    where: { id: positiveInteger(id, "TC request id") },
    include: {
      student: { select: { id: true, admissionNumber: true, firstName: true, middleName: true, lastName: true, guardianName: true, guardianContact: true, dateOfBirth: true } },
      feedback: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!request) throw new PanelAuthorizationError(404, "Transfer certificate request not found.");
  assertLifecycleScope(authorization, request);
  return request;
}

export async function transitionTcRequest(id, authorization, body) {
  const request = await tcRequestById(id, authorization);
  const action = String(body?.action || "").trim().toUpperCase();
  const note = text(body?.note, "note", { required: action !== "ISSUE", max: 5_000 });
  const scope = scopeOf(request);

  if (["APPROVE", "RETURN", "REJECT"].includes(action)) {
    if (!hasPermission(authorization, "TC_PRINCIPAL_APPROVE")) throw new PanelAuthorizationError(403, "Principal approval permission is required.");
    if (!["REQUESTED", "RETURNED_FOR_CLARIFICATION"].includes(request.status)) throw new PanelAuthorizationError(409, "This TC request is not awaiting principal review.");
    const status = action === "APPROVE" ? "PRINCIPAL_APPROVED" : action === "RETURN" ? "RETURNED_FOR_CLARIFICATION" : "PRINCIPAL_REJECTED";
    const updated = await prisma.transferCertificateRequest.update({
      where: { id: request.id },
      data: { status, principalDecisionById: authorization.user.id, principalDecisionAt: new Date(), principalRemarks: note },
    });
    return { request, updated, scope };
  }

  if (["FINANCE_CLEAR", "FINANCE_PENDING"].includes(action)) {
    if (!hasPermission(authorization, "TC_FINANCE_VERIFY")) throw new PanelAuthorizationError(403, "COEF financial-verification permission is required.");
    if (request.status !== "PRINCIPAL_APPROVED") throw new PanelAuthorizationError(409, "Principal approval is required before financial verification.");
    const snapshot = await financialSnapshot(request.studentId, request.academicYear);
    if (action === "FINANCE_CLEAR" && snapshot.outstandingBalance > 0) {
      throw new PanelAuthorizationError(409, `TC financial clearance is blocked: ${snapshot.outstandingBalance.toFixed(2)} remains unpaid in the school ledger. Record reconciliation instead.`);
    }
    const status = action === "FINANCE_CLEAR" ? "FINANCE_CLEARED" : "FINANCE_PENDING_RECONCILIATION";
    const updated = await prisma.transferCertificateRequest.update({
      where: { id: request.id },
      data: { status, financeVerifiedById: authorization.user.id, financeVerifiedAt: new Date(), financeRemarks: note, financialSnapshot: snapshot },
    });
    return { request, updated, scope };
  }

  if (action === "ISSUE") {
    if (!hasPermission(authorization, "TC_ISSUE")) throw new PanelAuthorizationError(403, "TC issue permission is required.");
    if (!hasPermission(authorization, "TC_FINANCE_VERIFY")) throw new PanelAuthorizationError(403, "Only COEF financial authority can issue a school TC.");
    if (request.status !== "FINANCE_CLEARED") throw new PanelAuthorizationError(409, "COEF financial clearance is required before issuing a TC.");
    const snapshot = await financialSnapshot(request.studentId, request.academicYear);
    if (snapshot.outstandingBalance > 0) {
      throw new PanelAuthorizationError(409, `TC issuance is blocked: ${snapshot.outstandingBalance.toFixed(2)} remains unpaid in the school ledger.`);
    }
    const governmentTcId = text(body?.governmentTcId, "governmentTcId", { required: true, max: 100 }).toUpperCase();
    const conflictingGovernmentTc = await prisma.transferCertificateRequest.findUnique({
      where: { governmentTcId },
      select: { id: true },
    });
    if (conflictingGovernmentTc && conflictingGovernmentTc.id !== request.id) {
      throw new PanelAuthorizationError(409, "This Government TC ID is already assigned to another certificate.");
    }
    const tcNumber = await generatedTcNumber();
    const documentReference = `/api/student-lifecycle/tc-requests/${request.id}/document`;
    const updated = await prisma.$transaction(async (tx) => {
      const issued = await tx.transferCertificateRequest.update({
        where: { id: request.id },
        data: {
          status: "ISSUED",
          issuedById: authorization.user.id,
          issuedAt: new Date(),
          tcNumber,
          governmentTcId,
          documentReference,
          principalRemarks: request.principalRemarks,
          financialSnapshot: snapshot,
        },
      });
      await tx.student.update({ where: { id: request.studentId }, data: { status: "TRANSFERRED" } });
      await tx.studentEnrollment.updateMany({
        where: { studentId: request.studentId, status: { in: ["PENDING_PAYMENT", "ACTIVE", "TRANSFER_REQUESTED"] } },
        data: { status: "TRANSFERRED", leavingDate: request.requestedTransferDate, completedAt: new Date() },
      });
      return issued;
    });
    return { request, updated, scope };
  }

  throw new PanelAuthorizationError(400, "Unsupported TC workflow action.");
}
