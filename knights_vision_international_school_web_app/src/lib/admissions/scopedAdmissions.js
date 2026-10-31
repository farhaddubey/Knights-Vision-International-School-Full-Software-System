import crypto from "crypto";
import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  buildScopeWhere,
  hasPermission,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const APPLICATION_STATUSES = new Set([
  "PENDING",
  "QUALIFIED",
  "NOT_QUALIFIED",
  "ADMITTED",
  "SELECTED",
  "REJECTED",
  "BANNED",
]);

const ADMISSION_STATUSES = new Set(["PENDING", "SELECTED", "CONFIRMED", "CANCELLED", "COMPLETED"]);
const ADMISSION_TYPES = new Set(["FRESH", "READMISSION", "DIRECT", "MIGRATION"]);
const FEE_CATEGORIES = new Set(["KSAT_SUPPORT_PLUS", "KSAT_SUPPORT", "KSAT_STANDARD", "KSAT_GENERAL", "DIRECT_GENERAL"]);

export function positiveInteger(value) {
  const parsed = Number.parseInt(String(value ?? ""), 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

export function validYear(value, fallback = new Date().getFullYear()) {
  const parsed = Number.parseInt(String(value ?? fallback), 10);
  return Number.isInteger(parsed) && parsed >= 2000 && parsed <= 2100 ? parsed : null;
}

export function pagination(searchParams) {
  const page = Math.max(positiveInteger(searchParams.get("page")) || 1, 1);
  // Legacy PDF screens explicitly request 9,999 rows. Keep that contract while
  // bounding an untrusted query to a still finite, scoped result set.
  const pageSize = Math.min(Math.max(positiveInteger(searchParams.get("pageSize")) || 10, 1), 10_000);
  return { page, pageSize, skip: (page - 1) * pageSize };
}

export function errorResponse(error, fallback = "Unable to process the admission request.") {
  if (error instanceof PanelAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }
  if (error?.code === "P2002") {
    return NextResponse.json({ error: "A record with one of these unique values already exists." }, { status: 409 });
  }
  if (error?.code === "P2003") {
    return NextResponse.json({ error: "A referenced admission record no longer exists or cannot be changed." }, { status: 409 });
  }
  if (error?.code === "P2025") {
    return NextResponse.json({ error: "The requested admission record was not found." }, { status: 404 });
  }
  console.error("[Admission access]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function requireAdmissionRead(request) {
  return requirePanelPermission(request, "admission.read");
}

export async function requireAdmissionManage(request) {
  return requirePanelPermission(request, "admission.manage");
}

export function requireAdditionalPermission(authorization, permission, message) {
  if (!hasPermission(authorization, permission)) {
    throw new PanelAuthorizationError(403, message || "You do not have permission to perform this action.");
  }
}

export function assertScope(authorization, target, message = "You do not have access to this school, branch, or class scope.") {
  if (!hasScopeAccess(authorization, target)) {
    throw new PanelAuthorizationError(403, message);
  }
}

export function scopeWhere(authorization) {
  return buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId", classId: "classId" });
}

export function readString(value, field, { required = false, maxLength = 300 } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new PanelAuthorizationError(400, `${field} must be text.`);
  const result = value.trim();
  if (!result && required) throw new PanelAuthorizationError(400, `${field} is required.`);
  if (result.length > maxLength) throw new PanelAuthorizationError(400, `${field} is too long.`);
  return result || null;
}

export function readDate(value, field, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const result = new Date(value);
  if (Number.isNaN(result.getTime())) throw new PanelAuthorizationError(400, `${field} must be a valid date.`);
  return result;
}

export function readNumber(value, field, { required = false, min = null, max = null } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const result = Number(value);
  if (!Number.isFinite(result) || (min != null && result < min) || (max != null && result > max)) {
    throw new PanelAuthorizationError(400, `${field} is invalid.`);
  }
  return result;
}

function enumValue(value, values, field, { required = false } = {}) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, `${field} is required.`);
    return null;
  }
  const result = String(value).trim().toUpperCase();
  if (!values.has(result)) throw new PanelAuthorizationError(400, `${field} is invalid.`);
  return result;
}

export function applicationStatus(value, options) {
  return enumValue(value, APPLICATION_STATUSES, "status", options);
}

export function admissionStatus(value, options) {
  return enumValue(value, ADMISSION_STATUSES, "status", options);
}

export function admissionType(value, options) {
  return enumValue(value, ADMISSION_TYPES, "admissionType", options);
}

export function admissionCategory(value, options) {
  return enumValue(value, FEE_CATEGORIES, "category", options);
}

export async function canonicalClassScope(input) {
  const classId = positiveInteger(input?.classId);
  if (!classId) throw new PanelAuthorizationError(400, "A valid classId is required.");

  const schoolClass = await prisma.schoolClass.findUnique({
    where: { id: classId },
    select: { id: true, schoolId: true, branchId: true, academicYear: true },
  });
  if (!schoolClass) throw new PanelAuthorizationError(404, "Class not found.");

  const suppliedSchoolId = input?.schoolId == null || input.schoolId === "" ? null : positiveInteger(input.schoolId);
  const suppliedBranchId = input?.branchId == null || input.branchId === "" ? null : positiveInteger(input.branchId);
  if ((input?.schoolId != null && input.schoolId !== "" && !suppliedSchoolId) ||
      (input?.branchId != null && input.branchId !== "" && !suppliedBranchId)) {
    throw new PanelAuthorizationError(400, "schoolId and branchId must be valid positive integers.");
  }
  if ((suppliedSchoolId && suppliedSchoolId !== schoolClass.schoolId) ||
      (suppliedBranchId && suppliedBranchId !== schoolClass.branchId)) {
    throw new PanelAuthorizationError(400, "The supplied school, branch, and class do not belong together.");
  }
  return {
    schoolId: schoolClass.schoolId,
    branchId: schoolClass.branchId,
    classId: schoolClass.id,
    academicYear: schoolClass.academicYear,
  };
}

export async function applicationById(applicationId, options = {}) {
  const id = positiveInteger(applicationId);
  if (!id) throw new PanelAuthorizationError(400, "A valid application id is required.");
  const application = await prisma.admissionTestApplication.findUnique({
    where: { id },
    ...(options.full ? {} : { select: {
      id: true,
      studentId: true,
      schoolId: true,
      branchId: true,
      classId: true,
      academicYear: true,
      status: true,
      admissionId: true,
      feeSchemeId: true,
    } }),
  });
  if (!application) throw new PanelAuthorizationError(404, "Admission application not found.");
  return application;
}

export async function admissionById(admissionId, select = undefined) {
  const id = positiveInteger(admissionId);
  if (!id) throw new PanelAuthorizationError(400, "A valid admission id is required.");
  const admission = await prisma.admission.findUnique({
    where: { id },
    select: select || { id: true, studentId: true, schoolId: true, branchId: true, classId: true, applicationId: true, feeSchemeId: true },
  });
  if (!admission) throw new PanelAuthorizationError(404, "Admission not found.");
  return admission;
}

export async function admissionTestById(testId) {
  const id = positiveInteger(testId);
  if (!id) throw new PanelAuthorizationError(400, "A valid admission test id is required.");
  const test = await prisma.admissionTest.findUnique({
    where: { id },
    select: { id: true, schoolId: true, branchId: true, classId: true, academicYear: true },
  });
  if (!test) throw new PanelAuthorizationError(404, "Admission test not found.");
  return test;
}

export async function studentById(studentId) {
  const id = positiveInteger(studentId);
  if (!id) throw new PanelAuthorizationError(400, "A valid studentId is required.");
  const student = await prisma.student.findUnique({
    where: { id },
    select: { id: true, schoolId: true, branchId: true, classId: true, academicYear: true, finalAdmissionId: true },
  });
  if (!student) throw new PanelAuthorizationError(404, "Student not found.");
  return student;
}

export async function feeSchemeForClass(feeSchemeId, classId) {
  if (feeSchemeId == null || feeSchemeId === "") return null;
  const id = positiveInteger(feeSchemeId);
  if (!id) throw new PanelAuthorizationError(400, "feeSchemeId must be a valid positive integer.");
  const scheme = await prisma.feeScheme.findUnique({ where: { id }, select: { id: true, classId: true, category: true, admissionFee: true, monthlyFee: true, readmissionFee: true } });
  if (!scheme) throw new PanelAuthorizationError(404, "Fee scheme not found.");
  if (scheme.classId !== classId) throw new PanelAuthorizationError(400, "The fee scheme does not belong to the selected class.");
  return scheme;
}

export function generatedApplicationUid() {
  return `SSP-APP-${new Date().getFullYear()}-${crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase()}`;
}

function hasOwn(input, field) {
  return Object.prototype.hasOwnProperty.call(input || {}, field);
}

function optionalTextFields(input, target, fields, creating) {
  for (const [field, maxLength] of fields) {
    if (creating || hasOwn(input, field)) {
      target[field] = readString(input[field], field, { maxLength });
    }
  }
}

function optionalNumberFields(input, target, fields, creating) {
  for (const [field, min, max] of fields) {
    if (creating || hasOwn(input, field)) {
      target[field] = readNumber(input[field], field, { min, max });
    }
  }
}

/**
 * The browser may provide profile details, but never the school/branch/class
 * scope. The caller first resolves that scope from SchoolClass and supplies it
 * here. This preserves legacy payload fields without permitting mass updates.
 */
export function applicationWriteData(input, scope, { creating = false } = {}) {
  const data = {};
  if (creating || hasOwn(input, "studentUid")) {
    data.studentUid = readString(input.studentUid, "studentUid", { maxLength: 30 }) || generatedApplicationUid();
  }
  if (creating || hasOwn(input, "firstName")) data.firstName = readString(input.firstName, "firstName", { required: creating, maxLength: 100 });
  if (creating || hasOwn(input, "lastName")) data.lastName = readString(input.lastName, "lastName", { required: creating, maxLength: 100 });
  if (creating || hasOwn(input, "gender")) data.gender = readString(input.gender, "gender", { required: creating, maxLength: 20 });
  if (creating || hasOwn(input, "dateOfBirth")) data.dateOfBirth = readDate(input.dateOfBirth, "dateOfBirth", { required: creating });
  if (creating || hasOwn(input, "category")) data.category = admissionCategory(input.category, { required: creating });
  if (creating || hasOwn(input, "status")) data.status = applicationStatus(input.status, { required: false }) || "PENDING";

  optionalTextFields(input, data, [
    ["guardian_uid", 30], ["middleName", 100], ["bloodGroup", 10], ["nationality", 50], ["religion", 50], ["casteCategory", 50],
    ["profileImageUrl", 300], ["dreamOrAim", 200], ["hobbies", 200], ["specialTalents", 200], ["fatherName", 100],
    ["fatherContact", 20], ["fatherEmail", 100], ["fatherProfession", 100], ["fatherQualification", 100], ["motherName", 100],
    ["motherContact", 20], ["motherEmail", 100], ["motherProfession", 100], ["motherQualification", 100], ["guardianName", 100],
    ["guardianContact", 20], ["guardianRelation", 50], ["guardianAddress", 300], ["emergencyContact", 20], ["residentialAddress", 300],
    ["city", 100], ["state", 100], ["pinCode", 10], ["preferredLanguage", 50], ["previousSchoolName", 150], ["lastExamPassed", 100],
    ["reasonOfTransfer", 300], ["previousSchoolMedium", 50], ["previousSchoolBoard", 50], ["previousSchoolCity", 100],
    ["admitCardNumber", 30], ["selectionRemarks", 300], ["phaseSelected", 50], ["remarksInternal", 300],
  ], creating);
  optionalNumberFields(input, data, [
    ["fatherIncome", 0, null], ["motherIncome", 0, null], ["lastExamResult", 0, null], ["previousAdmissionFee", 0, null],
    ["previousMonthlyFee", 0, null], ["totalMarks", 0, null], ["rank", 1, null],
  ], creating);

  if (creating || hasOwn(input, "isTransportRequired")) {
    if (input.isTransportRequired == null) data.isTransportRequired = false;
    else if (typeof input.isTransportRequired !== "boolean") throw new PanelAuthorizationError(400, "isTransportRequired must be true or false.");
    else data.isTransportRequired = input.isTransportRequired;
  }
  if (creating || hasOwn(input, "qualified")) {
    if (input.qualified == null) data.qualified = creating ? false : null;
    else if (typeof input.qualified !== "boolean") throw new PanelAuthorizationError(400, "qualified must be true or false.");
    else data.qualified = input.qualified;
  }
  if (creating || hasOwn(input, "seatRollNumber")) data.seatRollNumber = readString(input.seatRollNumber, "seatRollNumber", { maxLength: 20 });
  if (creating || hasOwn(input, "admissionAllotmentDate")) data.admissionAllotmentDate = readDate(input.admissionAllotmentDate, "admissionAllotmentDate");

  if (creating || hasOwn(input, "studentId")) {
    data.studentId = input.studentId == null || input.studentId === "" ? null : positiveInteger(input.studentId);
    if (data.studentId == null && input.studentId != null && input.studentId !== "") throw new PanelAuthorizationError(400, "studentId must be valid.");
  }
  if (creating || hasOwn(input, "admissionId")) {
    data.admissionId = input.admissionId == null || input.admissionId === "" ? null : positiveInteger(input.admissionId);
    if (data.admissionId == null && input.admissionId != null && input.admissionId !== "") throw new PanelAuthorizationError(400, "admissionId must be valid.");
  }
  if (creating || hasOwn(input, "feeSchemeId")) {
    data.feeSchemeId = input.feeSchemeId == null || input.feeSchemeId === "" ? null : positiveInteger(input.feeSchemeId);
    if (data.feeSchemeId == null && input.feeSchemeId != null && input.feeSchemeId !== "") throw new PanelAuthorizationError(400, "feeSchemeId must be valid.");
  }
  if (creating || hasOwn(input, "academicYear")) {
    data.academicYear = validYear(input.academicYear);
    if (!data.academicYear) throw new PanelAuthorizationError(400, "academicYear must be between 2000 and 2100.");
  }

  if (creating || hasOwn(input, "classId") || hasOwn(input, "branchId") || hasOwn(input, "schoolId")) {
    data.schoolId = scope.schoolId;
    data.branchId = scope.branchId;
    data.classId = scope.classId;
  }
  return data;
}

export function admissionTestWriteData(input, scope, { creating = false } = {}) {
  const data = {};
  if (creating || hasOwn(input, "name")) data.name = readString(input.name, "name", { required: creating, maxLength: 100 });
  if (creating || hasOwn(input, "testDate")) data.testDate = readDate(input.testDate, "testDate", { required: creating });
  if (creating || hasOwn(input, "maxMarks")) data.maxMarks = readNumber(input.maxMarks, "maxMarks", { required: creating, min: 0 });
  if (creating || hasOwn(input, "venue")) data.venue = readString(input.venue, "venue", { maxLength: 200 });
  if (creating || hasOwn(input, "academicYear")) {
    data.academicYear = validYear(input.academicYear);
    if (!data.academicYear) throw new PanelAuthorizationError(400, "academicYear must be between 2000 and 2100.");
  }
  if (creating || hasOwn(input, "classId") || hasOwn(input, "branchId") || hasOwn(input, "schoolId")) {
    data.schoolId = scope.schoolId;
    data.branchId = scope.branchId;
    data.classId = scope.classId;
  }
  return data;
}

export function admissionWriteData(input, scope, { creating = false } = {}) {
  const data = {};
  if (creating || hasOwn(input, "studentId")) {
    data.studentId = positiveInteger(input.studentId);
    if (!data.studentId) throw new PanelAuthorizationError(400, "A valid studentId is required.");
  }
  if (creating || hasOwn(input, "admissionType")) data.admissionType = admissionType(input.admissionType, { required: creating });
  if (creating || hasOwn(input, "admissionDate")) data.admissionDate = readDate(input.admissionDate, "admissionDate", { required: creating });
  if (creating || hasOwn(input, "status")) data.status = admissionStatus(input.status, { required: false }) || "PENDING";
  if (creating || hasOwn(input, "previousClassId")) {
    data.previousClassId = input.previousClassId == null || input.previousClassId === "" ? null : positiveInteger(input.previousClassId);
    if (data.previousClassId == null && input.previousClassId != null && input.previousClassId !== "") throw new PanelAuthorizationError(400, "previousClassId must be valid.");
  }
  if (creating || hasOwn(input, "transferCertificateId")) data.transferCertificateId = readString(input.transferCertificateId, "transferCertificateId", { maxLength: 50 });
  if (creating || hasOwn(input, "applicationId")) {
    data.applicationId = input.applicationId == null || input.applicationId === "" ? null : positiveInteger(input.applicationId);
    if (data.applicationId == null && input.applicationId != null && input.applicationId !== "") throw new PanelAuthorizationError(400, "applicationId must be valid.");
  }
  if (creating || hasOwn(input, "feeSchemeId")) {
    data.feeSchemeId = input.feeSchemeId == null || input.feeSchemeId === "" ? null : positiveInteger(input.feeSchemeId);
    if (data.feeSchemeId == null && input.feeSchemeId != null && input.feeSchemeId !== "") throw new PanelAuthorizationError(400, "feeSchemeId must be valid.");
  }
  if (creating || hasOwn(input, "classId") || hasOwn(input, "branchId") || hasOwn(input, "schoolId")) {
    data.schoolId = scope.schoolId;
    data.branchId = scope.branchId;
    data.classId = scope.classId;
  }
  return data;
}

export async function routeId(context) {
  const params = await context?.params;
  return params?.id;
}

export function combineWhere(scope, extra = {}) {
  const scopeKeys = Object.keys(scope || {});
  if (scopeKeys.length === 0) return extra;
  if (Object.keys(extra).length === 0) return scope;
  return { AND: [scope, extra] };
}
