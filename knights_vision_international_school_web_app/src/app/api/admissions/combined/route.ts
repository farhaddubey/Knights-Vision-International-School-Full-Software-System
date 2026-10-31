import { NextResponse } from "next/server";
import prisma from "@/src/lib/prisma";
import {
  applicationById,
  assertScope,
  errorResponse,
  feeSchemeForClass,
  positiveInteger,
  readDate,
  requireAdditionalPermission,
  requireAdmissionManage,
  validYear,
} from "@/src/lib/admissions/scopedAdmissions";
import { PanelAuthorizationError } from "@/src/lib/rbac/authorization";
import {
  formatAdmissionRecordNumber,
  formatStudentAdmissionNumber,
} from "@/src/lib/students/admissionNumbers";

const ADMISSION_PAYMENT_METHODS = new Set(["CASH", "UPI", "BANK_TRANSFER", "ONLINE_GATEWAY", "CHEQUE"]);
const MONTHLY_PAYMENT_METHODS: Record<string, "CASH" | "UPI" | "NET_BANKING" | "ONLINE_GATEWAY"> = {
  CASH: "CASH",
  UPI: "UPI",
  BANK_TRANSFER: "NET_BANKING",
  ONLINE_GATEWAY: "ONLINE_GATEWAY",
};

function paidMonths(value: unknown) {
  if (value == null) return [];
  if (!Array.isArray(value)) throw new PanelAuthorizationError(400, "selectedMonths must be a list of month numbers.");
  const months = value.map((month) => Number.parseInt(String(month), 10));
  if (months.some((month) => !Number.isInteger(month) || month < 1 || month > 12) || new Set(months).size !== months.length) {
    throw new PanelAuthorizationError(400, "selectedMonths must contain unique values from 1 to 12.");
  }
  return months;
}

function paymentMethod(value: unknown, required: boolean) {
  if (value == null || value === "") {
    if (required) throw new PanelAuthorizationError(400, "paymentMethod is required when recording a payment.");
    return null;
  }
  const method = String(value).trim().toUpperCase();
  if (!ADMISSION_PAYMENT_METHODS.has(method)) throw new PanelAuthorizationError(400, "paymentMethod is invalid.");
  return method;
}

function optionalText(value: unknown, maxLength: number) {
  if (value == null || value === "") return null;
  const text = String(value).trim();
  if (text.length > maxLength) throw new PanelAuthorizationError(400, "A supplied text value is too long.");
  return text || null;
}

function numberOrNull(value: unknown) {
  if (value == null || value === "") return null;
  const result = Number(value);
  if (!Number.isFinite(result) || result < 0) throw new PanelAuthorizationError(400, "A supplied amount is invalid.");
  return result;
}

export async function POST(request: Request) {
  try {
    const authorization = await requireAdmissionManage(request);
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    if (!rows.length) return NextResponse.json({ error: "At least one admission is required." }, { status: 400 });

    const results = await prisma.$transaction(async (tx) => {
      const created = [];
      for (const input of rows) {
        const application = await applicationById(input?.applicationId, { full: true });
        assertScope(authorization, application, "You cannot finalize an application outside your assigned scope.");
        const feeScheme = await feeSchemeForClass(input?.feeSchemeId, application.classId);
        if (!feeScheme) throw new PanelAuthorizationError(400, "A feeSchemeId is required to finalize admission.");
        // A finalized application must remain in the academic session of the
        // selected application/class; a request body cannot override it.
        const academicYear = validYear(application.academicYear);
        if (!academicYear) throw new PanelAuthorizationError(400, "academicYear must be between 2000 and 2100.");
        const admissionDate = readDate(input?.admissionDate, "admissionDate") || new Date();
        const isFeePaid = input?.isFeePaid === true;
        const months = paidMonths(input?.selectedMonths);
        const method = paymentMethod(input?.paymentMethod, isFeePaid || months.length > 0);
        if (isFeePaid || months.length > 0) {
          requireAdditionalPermission(authorization, "fee.manage", "Recording admission or monthly-fee payments requires fee-manage permission.");
        }
        if (months.length && !MONTHLY_PAYMENT_METHODS[method || ""]) {
          throw new PanelAuthorizationError(400, "Monthly fee payments require CASH, UPI, BANK_TRANSFER, or ONLINE_GATEWAY.");
        }

        const existingAdmission = await tx.admission.findUnique({ where: { applicationId: application.id }, select: { id: true } });
        if (existingAdmission) throw new PanelAuthorizationError(409, "This application already has a finalized admission.");

        let studentId: number;
        let studentAdmissionNumber: string | null = null;
        if (application.studentId) {
          studentId = application.studentId;
          const student = await tx.student.findUnique({ where: { id: studentId }, select: { id: true, schoolId: true, branchId: true, classId: true, admissionNumber: true } });
          if (!student) throw new PanelAuthorizationError(409, "The linked student no longer exists.");
          if (student.schoolId !== application.schoolId || student.branchId !== application.branchId || student.classId !== application.classId) {
            throw new PanelAuthorizationError(409, "The linked student no longer matches this application's scope.");
          }
          studentAdmissionNumber = student.admissionNumber;
        } else {
          const student = await tx.student.create({
            data: {
              // The permanent number is derived from the database primary key
              // after creation, so it stays collision-free under concurrency.
              admissionNumber: null,
              rollNumber: application.studentUid,
              firstName: application.firstName,
              middleName: application.middleName,
              lastName: application.lastName,
              gender: application.gender,
              dateOfBirth: application.dateOfBirth,
              admissionDate,
              status: "ACTIVE",
              schoolId: application.schoolId,
              branchId: application.branchId,
              classId: application.classId,
              academicYear,
              admittedViaTest: application.qualified === true,
              studentCategory: application.category,
              feeSchemeId: feeScheme.id,
              isScholarshipHolder: input?.isScholarshipHolder === true,
              bloodGroup: application.bloodGroup,
              nationality: application.nationality,
              religion: application.religion,
              casteCategory: application.casteCategory,
              profileImageUrl: application.profileImageUrl,
              dreamOrAim: application.dreamOrAim,
              hobbies: application.hobbies,
              specialTalents: application.specialTalents,
              fatherName: application.fatherName,
              fatherContact: application.fatherContact,
              fatherEmail: application.fatherEmail,
              fatherProfession: application.fatherProfession,
              fatherQualification: application.fatherQualification,
              fatherIncome: application.fatherIncome,
              motherName: application.motherName,
              motherContact: application.motherContact,
              motherEmail: application.motherEmail,
              motherProfession: application.motherProfession,
              motherQualification: application.motherQualification,
              motherIncome: application.motherIncome,
              guardianName: application.guardianName,
              guardianContact: application.guardianContact,
              guardianRelation: application.guardianRelation,
              guardianAddress: application.guardianAddress,
              emergencyContact: application.emergencyContact,
              residentialAddress: application.residentialAddress,
              city: application.city,
              state: application.state,
              pinCode: application.pinCode,
              isTransportRequired: application.isTransportRequired,
              preferredLanguage: application.preferredLanguage,
              previousSchoolName: application.previousSchoolName,
              lastExamPassed: application.lastExamPassed,
              lastExamResult: application.lastExamResult,
              previousAdmissionFee: application.previousAdmissionFee,
              previousMonthlyFee: application.previousMonthlyFee,
              reasonOfTransfer: application.reasonOfTransfer,
              previousSchoolMedium: application.previousSchoolMedium,
              previousSchoolBoard: application.previousSchoolBoard,
              previousSchoolCity: application.previousSchoolCity,
            },
          });
          studentId = student.id;
        }

        if (!studentAdmissionNumber) {
          studentAdmissionNumber = formatStudentAdmissionNumber(studentId, academicYear);
          await tx.student.update({ where: { id: studentId }, data: { admissionNumber: studentAdmissionNumber } });
        }

        const priorAdmissions = await tx.admission.count({ where: { studentId } });
        const admissionType = application.category === "DIRECT_GENERAL" ? "DIRECT" : "FRESH";
        const finalAdmissionNumber = formatAdmissionRecordNumber({
          studentId,
          academicYear,
          admissionType,
          ordinal: priorAdmissions + 1,
        });
        const admission = await tx.admission.create({
          data: {
            studentId,
            schoolId: application.schoolId,
            branchId: application.branchId,
            classId: application.classId,
            admissionType,
            admissionDate,
            status: isFeePaid ? "CONFIRMED" : "PENDING",
            applicationId: application.id,
            feeSchemeId: feeScheme.id,
            finalAdmissionNumber,
          },
        });

        let admissionFeeTransaction = null;
        if (isFeePaid) {
          admissionFeeTransaction = await tx.admissionFeeTransaction.create({
            data: {
              admissionId: admission.id,
              studentId,
              schoolId: application.schoolId,
              branchId: application.branchId,
              classId: application.classId,
              academicYear,
              amount: feeScheme.admissionFee,
              feeType: application.category === "DIRECT_GENERAL" ? "MIGRATION" : "FRESH",
              paymentDate: new Date(),
              paymentMethod: method as "CASH" | "UPI" | "BANK_TRANSFER" | "ONLINE_GATEWAY" | "CHEQUE",
              transactionId: optionalText(input?.transactionId, 100),
              receivedBy: String(authorization.user.id),
              remarks: optionalText(input?.remarks, 300) || "First admission",
            },
          });
        }

        const monthlyFees = [];
        for (const month of months) {
          const year = month < 4 ? academicYear + 1 : academicYear;
          const monthlyFee = await tx.monthlyFee.upsert({
            where: { studentId_month_year: { studentId, month, year } },
            update: {
              admissionId: admission.id,
              schoolId: application.schoolId,
              branchId: application.branchId,
              classId: application.classId,
              academicYear,
              totalDue: feeScheme.monthlyFee,
              paidAmount: feeScheme.monthlyFee,
              status: "PAID",
              isWaived: false,
              waivedAmount: 0,
              remarks: optionalText(input?.remarks, 300) || "First admission",
            },
            create: {
              studentId,
              admissionId: admission.id,
              schoolId: application.schoolId,
              branchId: application.branchId,
              classId: application.classId,
              academicYear,
              month,
              year,
              dueDate: new Date(Date.UTC(year, month - 1, 1)),
              totalDue: feeScheme.monthlyFee,
              paidAmount: feeScheme.monthlyFee,
              status: "PAID",
              isWaived: false,
              waivedAmount: 0,
              remarks: optionalText(input?.remarks, 300) || "First admission",
              fineAmount: 0,
            },
          });
          const payment = await tx.monthlyFeePayment.create({
            data: {
              monthlyFeeId: monthlyFee.id,
              amount: feeScheme.monthlyFee,
              paymentDate: new Date(),
              method: MONTHLY_PAYMENT_METHODS[method || ""],
              transactionId: optionalText(input?.transactionId, 100),
              receivedBy: String(authorization.user.id),
              remarks: optionalText(input?.remarks, 300) || "First admission",
            },
          });
          monthlyFees.push({ ...monthlyFee, payment });
        }

        await tx.student.update({ where: { id: studentId }, data: { finalAdmissionId: admission.id, academicYear, feeSchemeId: feeScheme.id } });
        await tx.admissionTestApplication.update({
          where: { id: application.id },
          data: { studentId, status: "ADMITTED", finalAdmissionNumber, admissionConfirmedBy: String(authorization.user.id) },
        });
        created.push({ student: { id: studentId, studentUid: application.studentUid }, admission, admissionFeeTransaction, monthlyFees });
      }
      return created;
    });
    return NextResponse.json({ results }, { status: 201 });
  } catch (error) {
    return errorResponse(error, "Failed to finalize admission.");
  }
}
