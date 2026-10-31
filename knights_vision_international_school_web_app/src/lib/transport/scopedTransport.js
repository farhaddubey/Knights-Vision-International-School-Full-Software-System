import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  PanelAuthorizationError,
  buildScopeWhere,
  hasScopeAccess,
  requirePanelPermission,
} from "@/src/lib/rbac/authorization";

const vehicleTypes = new Set([
  "CAR", "SUV", "VAN", "TRUCK", "PICKUP", "BIKE", "ELECTRIC_CAR", "BUS", "FORKLIFT", "TRACTOR", "OTHER",
]);
const fuelTypes = new Set(["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "CNG", "LPG", "OTHER"]);
const transmissionTypes = new Set(["MANUAL", "AUTOMATIC", "SEMI_AUTOMATIC", "CVT", "OTHER"]);
const ownershipTypes = new Set(["OWNED", "LEASED", "RENTED", "FINANCED"]);
const vehicleStatuses = new Set(["ACTIVE", "IN_MAINTENANCE", "DECOMMISSIONED", "SOLD", "SCRAPPED"]);
const documentTypes = new Set([
  "RC", "INSURANCE", "FITNESS", "PUC", "PERMIT", "INVOICE", "LEASE_AGREEMENT", "WARRANTY", "SERVICE_HISTORY", "OTHER",
]);

export class TransportValidationError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "TransportValidationError";
    this.status = status;
  }
}

const has = (input, key) => Object.prototype.hasOwnProperty.call(input, key);

function objectInput(input) {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new TransportValidationError("A JSON object is required.");
  }
  return input;
}

function text(input, key, { required = false, max = 500, nullable = true } = {}) {
  if (!has(input, key)) {
    if (required) throw new TransportValidationError(`${key} is required.`);
    return undefined;
  }

  const value = input[key];
  if (value === null || value === "") {
    if (required || !nullable) throw new TransportValidationError(`${key} is required.`);
    return null;
  }
  if (typeof value !== "string") throw new TransportValidationError(`${key} must be text.`);
  const normalized = value.trim();
  if (!normalized && (required || !nullable)) throw new TransportValidationError(`${key} is required.`);
  if (normalized.length > max) throw new TransportValidationError(`${key} is too long.`);
  return normalized || null;
}

function positiveInteger(value, field) {
  const normalized = typeof value === "string" && value.trim() !== "" ? Number(value) : value;
  if (!Number.isInteger(normalized) || normalized <= 0) {
    throw new TransportValidationError(`${field} must be a positive whole number.`);
  }
  return normalized;
}

function nonNegativeInteger(input, key, { required = false, nullable = true } = {}) {
  if (!has(input, key)) {
    if (required) throw new TransportValidationError(`${key} is required.`);
    return undefined;
  }
  const value = input[key];
  if (value === null || value === "") {
    if (!nullable) throw new TransportValidationError(`${key} is required.`);
    return null;
  }
  const normalized = typeof value === "string" ? Number(value) : value;
  if (!Number.isInteger(normalized) || normalized < 0) {
    throw new TransportValidationError(`${key} must be a non-negative whole number.`);
  }
  return normalized;
}

function nonNegativeNumber(input, key) {
  if (!has(input, key)) return undefined;
  const value = input[key];
  if (value === null || value === "") return null;
  const normalized = typeof value === "string" ? Number(value) : value;
  if (typeof normalized !== "number" || !Number.isFinite(normalized) || normalized < 0) {
    throw new TransportValidationError(`${key} must be a non-negative number.`);
  }
  return normalized;
}

function dateValue(input, key, { required = false, nullable = true } = {}) {
  if (!has(input, key)) {
    if (required) throw new TransportValidationError(`${key} is required.`);
    return undefined;
  }
  const value = input[key];
  if (value === null || value === "") {
    if (required || !nullable) throw new TransportValidationError(`${key} is required.`);
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) throw new TransportValidationError(`${key} must be a valid date.`);
  return parsed;
}

function enumValue(input, key, values, { required = false } = {}) {
  if (!has(input, key)) {
    if (required) throw new TransportValidationError(`${key} is required.`);
    return undefined;
  }
  const value = input[key];
  if (typeof value !== "string" || !values.has(value)) {
    throw new TransportValidationError(`${key} is not a supported value.`);
  }
  return value;
}

function setIfPresent(data, key, value) {
  if (value !== undefined) data[key] = value;
}

export function assertTransportScope(authorization, target) {
  if (!hasScopeAccess(authorization, target)) {
    throw new PanelAuthorizationError(403, "You cannot access transport outside your assigned scope.");
  }
}

export async function scopedVehicle(authorization, vehicleId) {
  const vehicle = await prisma.fleetVehicle.findUnique({ where: { id: vehicleId }, select: { id: true, schoolId: true, branchId: true } });
  if (!vehicle) throw new TransportValidationError("Vehicle not found.", 404);
  assertTransportScope(authorization, vehicle);
  return vehicle;
}

async function validateRelations(data) {
  if (data.assignedDriverId) {
    const driver = await prisma.user.findUnique({ where: { id: data.assignedDriverId }, select: { id: true } });
    if (!driver) throw new TransportValidationError("Assigned driver not found.", 404);
  }
  if (data.depotId) {
    const depot = await prisma.depot.findUnique({ where: { id: data.depotId }, select: { id: true } });
    if (!depot) throw new TransportValidationError("Depot not found.", 404);
  }
}

export const routeId = (value, label = "ID") => positiveInteger(value, label);

export const requireTransportRead = (request) => requirePanelPermission(request, "transport.read");
export const requireTransportManage = (request) => requirePanelPermission(request, "transport.manage");

export const transportScopeWhere = (authorization) => buildScopeWhere(authorization, { schoolId: "schoolId", branchId: "branchId" });

export async function transportBranchScope(authorization, branchId) {
  const branch = await prisma.schoolBranch.findUnique({ where: { id: positiveInteger(branchId, "branchId") }, select: { id: true, schoolId: true } });
  if (!branch) throw new TransportValidationError("Branch not found.", 404);
  if (!hasScopeAccess(authorization, { schoolId: branch.schoolId, branchId: branch.id })) {
    throw new PanelAuthorizationError(403, "You cannot manage transport outside your assigned branch scope.");
  }
  return branch;
}

export async function scopedTransportRecord(authorization, model, id, label) {
  const record = await prisma[model].findUnique({ where: { id: routeId(id, label) } });
  if (!record) throw new TransportValidationError(`${label} not found.`, 404);
  if (!hasScopeAccess(authorization, record)) throw new PanelAuthorizationError(403, "You cannot access transport outside your assigned scope.");
  return record;
}

export function transportError(error, fallback) {
  // Next.js may load a route and this shared module through separate development
  // chunks. Checking the stable error name as well as instanceof preserves the
  // intended 4xx response in both development and production bundles.
  if (error instanceof PanelAuthorizationError || error?.name === "PanelAuthorizationError") {
    return NextResponse.json({ success: false, message: error.message }, { status: error.status || 401 });
  }
  if (error instanceof TransportValidationError || error?.name === "TransportValidationError") {
    return NextResponse.json({ error: error.message }, { status: error.status || 400 });
  }
  if (error && typeof error === "object" && error.code === "P2002") {
    return NextResponse.json({ error: "A record with those unique values already exists." }, { status: 409 });
  }
  if (error && typeof error === "object" && error.code === "P2025") {
    return NextResponse.json({ error: "The requested transport record was not found." }, { status: 404 });
  }
  if (error && typeof error === "object" && error.code === "P2003") {
    return NextResponse.json({ error: "That change is blocked by an existing transport relationship." }, { status: 409 });
  }
  console.error("[Transport]", error);
  return NextResponse.json({ error: fallback }, { status: 500 });
}

export async function vehicleWriteData(input, authorization, { creating = false } = {}) {
  const body = objectInput(input);
  const data = {};
  setIfPresent(data, "registrationNumber", text(body, "registrationNumber", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "chassisNumber", text(body, "chassisNumber", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "engineNumber", text(body, "engineNumber", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "vinNumber", text(body, "vinNumber", { max: 100 }));
  setIfPresent(data, "vehicleType", enumValue(body, "vehicleType", vehicleTypes, { required: creating }));
  setIfPresent(data, "make", text(body, "make", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "model", text(body, "model", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "variant", text(body, "variant", { max: 100 }));
  setIfPresent(data, "fuelType", enumValue(body, "fuelType", fuelTypes, { required: creating }));
  setIfPresent(data, "transmissionType", enumValue(body, "transmissionType", transmissionTypes, { required: creating }));
  setIfPresent(data, "color", text(body, "color", { max: 50 }));
  setIfPresent(data, "seatingCapacity", nonNegativeInteger(body, "seatingCapacity", { required: creating, nullable: false }));
  setIfPresent(data, "loadingCapacityKg", nonNegativeInteger(body, "loadingCapacityKg"));
  setIfPresent(data, "registrationDate", dateValue(body, "registrationDate", { required: creating, nullable: false }));
  setIfPresent(data, "modelYear", nonNegativeInteger(body, "modelYear", { required: creating, nullable: false }));
  if (data.modelYear !== undefined && (data.modelYear < 1886 || data.modelYear > new Date().getUTCFullYear() + 2)) {
    throw new TransportValidationError("modelYear is outside a valid vehicle range.");
  }
  setIfPresent(data, "rcExpiryDate", dateValue(body, "rcExpiryDate", { required: creating, nullable: false }));
  setIfPresent(data, "fitnessExpiryDate", dateValue(body, "fitnessExpiryDate", { required: creating, nullable: false }));
  setIfPresent(data, "insuranceCompany", text(body, "insuranceCompany", { max: 150 }));
  setIfPresent(data, "insurancePolicyNumber", text(body, "insurancePolicyNumber", { max: 150 }));
  setIfPresent(data, "insuranceExpiryDate", dateValue(body, "insuranceExpiryDate", { required: creating, nullable: false }));
  setIfPresent(data, "pucExpiryDate", dateValue(body, "pucExpiryDate", { required: creating, nullable: false }));
  setIfPresent(data, "permitType", text(body, "permitType", { max: 100 }));
  setIfPresent(data, "permitExpiryDate", dateValue(body, "permitExpiryDate", { required: creating, nullable: false }));
  setIfPresent(data, "odometer", nonNegativeInteger(body, "odometer"));
  setIfPresent(data, "lastServiceDate", dateValue(body, "lastServiceDate"));
  setIfPresent(data, "nextServiceDueDate", dateValue(body, "nextServiceDueDate"));
  setIfPresent(data, "warrantyExpiryDate", dateValue(body, "warrantyExpiryDate"));
  setIfPresent(data, "leaseExpiryDate", dateValue(body, "leaseExpiryDate"));
  setIfPresent(data, "status", enumValue(body, "status", vehicleStatuses));
  setIfPresent(data, "ownershipType", enumValue(body, "ownershipType", ownershipTypes, { required: creating }));
  setIfPresent(data, "decommissionDate", dateValue(body, "decommissionDate"));
  setIfPresent(data, "remarks", text(body, "remarks", { max: 2000 }));
  setIfPresent(data, "assignedDriverId", has(body, "assignedDriverId") && body.assignedDriverId !== null && body.assignedDriverId !== "" ? positiveInteger(body.assignedDriverId, "assignedDriverId") : has(body, "assignedDriverId") ? null : undefined);
  setIfPresent(data, "depotId", has(body, "depotId") && body.depotId !== null && body.depotId !== "" ? positiveInteger(body.depotId, "depotId") : has(body, "depotId") ? null : undefined);
  setIfPresent(data, "gpsDeviceId", text(body, "gpsDeviceId", { max: 200 }));
  if (has(body, "telematicsProfile")) {
    const profile = body.telematicsProfile;
    if (profile !== null && (typeof profile !== "object" || Array.isArray(profile))) {
      throw new TransportValidationError("telematicsProfile must be an object.");
    }
    data.telematicsProfile = profile;
  }
  if (!creating && Object.keys(data).length === 0) throw new TransportValidationError("No permitted vehicle fields were supplied.");
  if (creating) {
    const branch = await transportBranchScope(authorization, body.branchId);
    data.branchId = branch.id;
    data.schoolId = branch.schoolId;
  }
  await validateRelations(data);
  return data;
}

export async function depotWriteData(input, authorization, { creating = false } = {}) {
  const body = objectInput(input);
  const data = {};
  setIfPresent(data, "name", text(body, "name", { required: creating, max: 100, nullable: false }));
  setIfPresent(data, "location", text(body, "location", { required: creating, max: 200, nullable: false }));
  setIfPresent(data, "address", text(body, "address", { max: 500 }));
  setIfPresent(data, "contactNumber", text(body, "contactNumber", { max: 50 }));
  if (!creating && Object.keys(data).length === 0) throw new TransportValidationError("No permitted depot fields were supplied.");
  if (creating) {
    const branch = await transportBranchScope(authorization, body.branchId);
    data.branchId = branch.id;
    data.schoolId = branch.schoolId;
  }
  return data;
}

function httpUrl(input, key, { required = false } = {}) {
  const value = text(input, key, { required, max: 2000, nullable: false });
  if (value === undefined) return undefined;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") throw new Error("invalid protocol");
  } catch {
    throw new TransportValidationError(`${key} must be an http or https URL.`);
  }
  return value;
}

export async function vehicleDocumentWriteData(input, authorization, { creating = false } = {}) {
  const body = objectInput(input);
  const data = {};
  if (creating || has(body, "vehicleId")) {
    const vehicleId = positiveInteger(body.vehicleId, "vehicleId");
    await scopedVehicle(authorization, vehicleId);
    data.vehicleId = vehicleId;
  }
  setIfPresent(data, "type", enumValue(body, "type", documentTypes, { required: creating }));
  setIfPresent(data, "documentUrl", httpUrl(body, "documentUrl", { required: creating }));
  setIfPresent(data, "fileName", text(body, "fileName", { max: 255 }));
  if (creating) data.uploadedBy = authorization.user.email || authorization.user.username || `user-${authorization.user.id}`;
  if (!creating && Object.keys(data).length === 0) throw new TransportValidationError("No permitted document fields were supplied.");
  return data;
}

export async function maintenanceWriteData(input, authorization, { creating = false } = {}) {
  const body = objectInput(input);
  const data = {};
  if (creating || has(body, "vehicleId")) {
    const vehicleId = positiveInteger(body.vehicleId, "vehicleId");
    await scopedVehicle(authorization, vehicleId);
    data.vehicleId = vehicleId;
  }
  setIfPresent(data, "serviceType", text(body, "serviceType", { required: creating, max: 150, nullable: false }));
  setIfPresent(data, "description", text(body, "description", { max: 2000 }));
  setIfPresent(data, "serviceDate", dateValue(body, "serviceDate", { required: creating, nullable: false }));
  setIfPresent(data, "serviceCenter", text(body, "serviceCenter", { max: 255 }));
  setIfPresent(data, "cost", nonNegativeNumber(body, "cost"));
  setIfPresent(data, "nextDueDate", dateValue(body, "nextDueDate"));
  setIfPresent(data, "odoAtService", nonNegativeInteger(body, "odoAtService"));
  if (!creating && Object.keys(data).length === 0) throw new TransportValidationError("No permitted maintenance fields were supplied.");
  return data;
}

export const vehicleDetailInclude = {
  assignedDriver: { select: { id: true, username: true, email: true, img_url: true, role: true } },
  depot: true,
  documents: true,
  maintenanceLogs: true,
};
