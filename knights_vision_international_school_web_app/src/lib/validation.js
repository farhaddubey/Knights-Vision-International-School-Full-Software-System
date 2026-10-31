// lib/validation.js
import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  slug: z.string().min(1, "Slug is required").max(100, "Slug is too long"),
  translations: z.record(z.any()).optional(),
});

export const districtSchema = z.object({
  location: z.string().min(1, "Location is required").max(100),
  state: z.string().min(1, "State is required").max(100),
  country: z.string().min(1, "Country is required").max(100),
  managerId: z.number().int().positive().optional(),
  contactInfo: z.string().optional(),
});

export const paymentSchema = z.object({
  requestId: z.number().int().positive("Request ID is required"),
  amount: z.number().positive("Amount must be positive"),
  currency: z.string().min(1, "Currency is required").max(3),
  status: z.enum(["PAID", "UNPAID", "PARTIALLY_PAID"]).optional(),
  method: z.enum(["CREDIT_CARD", "BANK_TRANSFER", "CASH", "UPI", "CRYPTO"]).optional(),
  taxId: z.number().int().positive().optional(),
});

export const brandSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  departmentId: z.number().int().positive(),
  description: z.string().optional(),
  translations: z.record(z.any()).optional(),
});

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  departmentId: z.number().int().positive().optional(),
  parentId: z.number().int().positive().optional(),
  translations: z.record(z.any()).optional(),
});

export const d2dOperationSchema = z.object({
  staffId: z.number().int().positive(),
  customerId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  visitDate: z.date(),
  status: z.string().optional(),
  notes: z.string().optional(),
});

export const analyticsSchema = z.object({
  serviceId: z.number().int().positive().optional(),
  districtId: z.number().int().positive().optional(),
  requestCount: z.number().int().optional(),
  completionRate: z.number().optional(),
  metrics: z.record(z.any()).optional(),
});

export const subscriptionSchema = z.object({
  customerId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  interval: z.string().min(1, "Interval is required"),
  status: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
});

export const inventorySchema = z.object({
  serviceId: z.number().int().positive(),
  item: z.string().min(1, "Item is required").max(100),
  quantity: z.number().int().positive(),
  minQuantity: z.number().int().optional(),
  supplierId: z.number().int().positive().optional(),
  itemType: z.string().optional(),
});

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  contactInfo: z.string().optional(),
});

export const taxSchema = z.object({
  country: z.string().min(1, "Country is required").max(100),
  rate: z.number().positive(),
});

export const serviceWorkflowSchema = z.object({
  serviceId: z.number().int().positive(),
  stepNumber: z.number().int().positive(),
  description: z.string().min(1, "Description is required"),
  status: z.string().optional(),
});

export const notificationSchema = z.object({
  customerId: z.number().int().positive(),
  requestId: z.number().int().positive().optional(),
  type: z.string().min(1, "Type is required"),
  message: z.string().min(1, "Message is required"),
  status: z.string().optional(),
});

export const feedbackSchema = z.object({
  customerId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  requestId: z.number().int().positive().optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const serviceDistrictSchema = z.object({
  serviceId: z.number().int().positive(),
  districtId: z.number().int().positive(),
  isAvailable: z.boolean().optional(),
});

export const auditLogSchema = z.object({
  userId: z.number().int().positive().optional(),
  action: z.string().min(1, "Action is required"),
  entityType: z.string().min(1, "Entity type is required"),
  serviceRequestId: z.number().int().positive().optional(),
  paymentId: z.number().int().positive().optional(),
  details: z.record(z.any()).optional(),
});