import prismaClientPackage from "@prisma/client";

const { PrismaClient } = prismaClientPackage;
const prisma = new PrismaClient();
const checkOnly = process.argv.includes("--check");

const permissions = [
  ["panel.access", "Access control panel", "Panel", "Open the protected school administration panel."],
  ["dashboard.read", "View dashboard", "Dashboard", "View operational dashboard information."],
  ["rbac.read", "View access control", "Access control", "View roles, permissions, and assignments."],
  ["rbac.manage", "Manage access control", "Access control", "Create roles and change role permissions or assignments."],
  ["audit.read", "View access audit", "Access control", "View authorization changes and access audit records."],
  ["user.read", "View users", "People", "View staff, guardian, and user records."],
  ["user.manage", "Manage users", "People", "Create or modify user records."],
  ["staff.read", "View staff", "People", "View faculty and employee records."],
  ["staff.manage", "Manage staff", "People", "Manage faculty and employee records."],
  ["school.read", "View institutions", "School structure", "View school profiles."],
  ["school.manage", "Manage institutions", "School structure", "Manage school profiles."],
  ["branch.read", "View branches", "School structure", "View school branches."],
  ["branch.manage", "Manage branches", "School structure", "Manage school branches."],
  ["class.read", "View classes", "Academics", "View classes and subjects."],
  ["class.manage", "Manage classes", "Academics", "Manage classes, subjects, and rooms."],
  ["student.read", "View students", "Students", "View student records."],
  ["student.manage", "Manage students", "Students", "Manage admissions and student records."],
  ["student_account.manage", "Manage student account activation", "Students", "Issue first-time activation codes for student accounts."],
  ["STUDENT_ADMISSION_CREATE", "Create student admission", "Student lifecycle", "Create a permanent student profile, first enrolment, and provisional admission-fee acknowledgement."],
  ["STUDENT_READMISSION_CREATE", "Prepare annual readmission", "Student lifecycle", "Create a next-session enrolment and provisional readmission-fee acknowledgement without changing historical records."],
  ["PAYMENT_COLLECT", "Collect lifecycle fee", "Student lifecycle", "Record an admission or readmission guardian collection acknowledgement; this is never a final ledger receipt."],
  ["PAYMENT_VERIFY", "Verify lifecycle fee", "Student lifecycle", "Verify the controlled admission or readmission custody chain within the existing fee workflow."],
  ["TC_REQUEST_CREATE", "Request transfer certificate", "Student lifecycle", "Create a scoped transfer-certificate request and record guardian feedback."],
  ["TC_PRINCIPAL_APPROVE", "Approve transfer certificate", "Student lifecycle", "Principal decision authority for transfer-certificate requests."],
  ["TC_FINANCE_VERIFY", "Verify TC financial clearance", "Student lifecycle", "COEF financial-clearance authority for transfer-certificate requests."],
  ["TC_ISSUE", "Issue transfer certificate", "Student lifecycle", "COEF issues a final transfer certificate only after Principal approval, a zero outstanding school-ledger balance, and Government TC ID capture."],
  ["attendance.read", "View attendance", "Academics", "View attendance information."],
  ["attendance.manage", "Manage attendance", "Academics", "Record and correct attendance."],
  ["homework.read", "View homework", "Academics", "View homework and coursework."],
  ["homework.manage", "Manage homework", "Academics", "Create and review homework."],
  ["exam.read", "View examinations", "Academics", "View examinations and results."],
  ["exam.manage", "Manage examinations", "Academics", "Manage examinations, marks, and result cards."],
  ["fee.read", "View fees", "Finance", "View fee schemes and receipts."],
  ["fee.manage", "Manage fees", "Finance", "Manage fees, overrides, and receipts."],
  ["fee.collect.provisional", "Record guardian collection", "Finance", "Record a guardian collection acknowledgement and custody handover without altering the student ledger."],
  ["fee.verify", "Verify COEF custody", "Finance", "COEF confirms or rejects a handed-over collection, then records its school bank submission. This does not settle the student ledger."],
  ["fee.receive", "Confirm central bank receipt", "Finance", "Phase 2 Central Administration permission to confirm a COEF bank submission and create the final ledger receipt."],
  ["payroll.read", "View payroll", "Finance", "View employee salary and payment records."],
  ["payroll.manage", "Manage payroll", "Finance", "Create salary records and post employee salary payments."],
  ["admission.read", "View admissions", "Admissions", "View applications and admissions."],
  ["admission.manage", "Manage admissions", "Admissions", "Manage applications, admissions, and test evaluation."],
  ["notice.read", "View notices", "Communication", "View school notices and communication records."],
  ["notice.manage", "Manage notices", "Communication", "Create or manage notices and communications."],
  ["guardian_communication.read", "View guardian communication", "Communication", "View guardian communication and parent-teacher records."],
  ["guardian_communication.manage", "Manage guardian communication", "Communication", "Create or manage guardian communication and parent-teacher records."],
  ["operations.read", "View school operations", "Operations", "View institution operations, facilities, and operational controls."],
  ["operations.manage", "Manage school operations", "Operations", "Manage institution operations, facilities, and operational controls."],
  ["approval.submit", "Submit policy exceptions", "Operations", "Submit a justified school-level policy exception for headquarters review."],
  ["approval.read", "View operational approvals", "Operations", "View operational requests, decisions, and approval history."],
  ["approval.manage", "Decide operational approvals", "Operations", "Approve or reject scoped operational requests."],
  ["transport.read", "View transport", "Transport", "View fleet and transport information."],
  ["transport.manage", "Manage transport", "Transport", "Manage fleet and transport operations."],
  ["media.read", "View media", "Website", "View media and image management."],
  ["media.manage", "Manage media", "Website", "Upload or manage media."],
  ["evidence.submit", "Submit school evidence", "School evidence", "Principal submits a categorised school-evidence image directly to CEO/CTO Administration."],
  ["evidence.read", "View school evidence", "School evidence", "View scoped school-evidence submissions and their final Administration decision."],
  ["evidence.verify", "Verify school evidence", "School evidence", "CEO or CTO makes the final verification or rejection decision for submitted school evidence."],
  ["evidence.delete", "Delete retained school evidence", "School evidence", "CEO or CTO may delete evidence only after the enforced 90-day retention period."],
  ["website.read", "View website controls", "Website", "View public website configuration."],
  ["website.manage", "Manage website controls", "Website", "Manage website configuration and homepage content."],
];

const allPermissionCodes = permissions.map(([code]) => code);
const criticalPermissionCodes = new Set([
  "rbac.manage",
  "student_account.manage",
  "PAYMENT_VERIFY",
  "TC_PRINCIPAL_APPROVE",
  "TC_FINANCE_VERIFY",
  "TC_ISSUE",
  "fee.manage",
  "fee.verify",
  "payroll.manage",
  "exam.manage",
  "user.manage",
  "staff.manage",
]);
const highRiskPermissionCodes = new Set([
  "school.manage",
  "branch.manage",
  "student.manage",
  "STUDENT_ADMISSION_CREATE",
  "STUDENT_READMISSION_CREATE",
  "PAYMENT_COLLECT",
  "TC_REQUEST_CREATE",
  "admission.manage",
  "fee.collect.provisional",
  "attendance.manage",
  "homework.manage",
  "notice.manage",
  "guardian_communication.manage",
  "operations.manage",
  "approval.manage",
  "transport.manage",
  "media.manage",
  "evidence.verify",
  "evidence.delete",
  "website.manage",
]);

function riskLevelForPermission(code) {
  if (criticalPermissionCodes.has(code)) return "CRITICAL";
  if (highRiskPermissionCodes.has(code)) return "HIGH";
  return "STANDARD";
}

const academicRead = ["panel.access", "dashboard.read", "class.read", "student.read", "attendance.read", "homework.read", "exam.read", "notice.read"];
const academicManage = [...academicRead, "class.manage", "student.manage", "attendance.manage", "homework.manage", "exam.manage", "notice.manage", "approval.submit"];
const facultyBase = ["panel.access", "dashboard.read", "school.read", "branch.read", "class.read", "student.read", "approval.submit"];

// Teaching delivery deliberately excludes guardian communication and money
// handling. GCI adds a tightly-audited guardian collection/custody duty; COEF
// verifies receipt and records school-bank submission. Only Phase 2 Central
// Administration can settle a student ledger payment.
const teachingDelivery = [...facultyBase, "attendance.read", "attendance.manage", "homework.read", "homework.manage", "exam.read", "exam.manage", "notice.read"];
const principalSchoolLeadership = [
  ...academicManage,
  "school.read",
  "branch.read",
  "staff.read",
  "guardian_communication.read",
  "guardian_communication.manage",
  "operations.read",
  "operations.manage",
  "transport.read",
  "transport.manage",
  "TC_REQUEST_CREATE",
  "TC_PRINCIPAL_APPROVE",
  "STUDENT_ADMISSION_CREATE",
  "evidence.submit",
  "evidence.read",
];
const coefFinanceAndExaminations = [
  ...facultyBase,
  "student.manage",
  "student_account.manage",
  "admission.read",
  "admission.manage",
  "fee.read",
  "fee.manage",
  "fee.collect.provisional",
  "fee.verify",
  "attendance.read",
  "attendance.manage",
  "exam.read",
  "exam.manage",
  "notice.read",
  "guardian_communication.read",
  "STUDENT_ADMISSION_CREATE",
  "STUDENT_READMISSION_CREATE",
  "PAYMENT_COLLECT",
  "PAYMENT_VERIFY",
  "TC_REQUEST_CREATE",
  "TC_FINANCE_VERIFY",
  "TC_ISSUE",
];
const gciTeachingAndGuardianLiaison = [
  ...teachingDelivery,
  "fee.read",
  "fee.collect.provisional",
  "notice.manage",
  "guardian_communication.read",
  "guardian_communication.manage",
  "student_account.manage",
  "STUDENT_ADMISSION_CREATE",
  "PAYMENT_COLLECT",
  "TC_REQUEST_CREATE",
];
const headquartersBase = ["panel.access", "dashboard.read", "school.read", "branch.read", "class.read", "student.read", "approval.submit", "approval.read"];
const peopleManage = [...headquartersBase, "user.read", "user.manage", "staff.read", "staff.manage", "attendance.read", "attendance.manage"];
// TEMPORARY HQ collaboration override, explicitly approved by the school
// owner: COO works alongside CEO with the complete Central Administration
// permission set during consolidation. Revert this to a least-privilege COO
// set before production access is enabled.
const chiefOperatingOfficer = allPermissionCodes;
const chiefFinancialOfficer = [...headquartersBase, "fee.read", "fee.manage", "fee.receive", "payroll.read", "payroll.manage", "admission.read", "operations.read", "approval.manage"];

const roles = [
  ["SYSTEM_ADMIN", "System Administrator", "Separate technical administrator with full authorised inspection and maintenance access. Every sensitive-record action must remain auditable.", allPermissionCodes],
  ["CEO", "Chief Executive Officer", "Headquarters executive authority across the school group.", allPermissionCodes],
  // TODO: Revert COO to its least-privilege operational permission set before
  // production. This temporary database grant is deliberately narrower in
  // scope than SYSTEM_ADMIN only by role identity, not by capabilities.
  ["COO", "Chief Operating Officer", "Temporary full Central Administration authority, jointly with CEO, while the consolidated administration panel is completed.", chiefOperatingOfficer],
  ["CFO", "Chief Financial Officer", "Headquarters authority for fees, payroll, finance policy, reconciliation oversight, and financial policy exceptions.", chiefFinancialOfficer],
  ["CAO", "Chief Academic Officer", "Headquarters authority for academic policy, curriculum standards, assessment structures, and academic exceptions.", [...academicManage, "school.read", "branch.read", "staff.read", "approval.read", "approval.manage"]],
  ["CHRO", "Chief Human Resources Officer", "Headquarters authority for recruitment, appointments, transfers, employment decisions, and staff policy exceptions.", [...peopleManage, "approval.manage"]],
  ["CTO", "Chief Technology Officer", "Headquarters authority for platform access, technology policy, digital infrastructure, media systems, and final school-evidence verification.", [...headquartersBase, "rbac.read", "rbac.manage", "audit.read", "media.read", "media.manage", "evidence.read", "evidence.verify", "evidence.delete", "website.read", "website.manage"]],
  ["CMO", "Chief Marketing and Admissions Officer", "Headquarters authority for admissions strategy, admission campaigns, and public school positioning.", [...headquartersBase, "admission.read", "admission.manage", "media.read", "media.manage", "website.read", "website.manage", "notice.read", "notice.manage", "approval.manage"]],
  ["CCO", "Chief Communications Officer", "Headquarters authority for communication policy, guardian communication standards, and public notices.", [...headquartersBase, "notice.read", "notice.manage", "guardian_communication.read", "guardian_communication.manage", "approval.manage"]],
  ["CCA", "Chief Compliance and Audit Officer", "Independent headquarters compliance review and audit authority without operational mutation powers.", [...headquartersBase, "rbac.read", "audit.read", "user.read", "staff.read", "fee.read", "payroll.read", "admission.read", "exam.read", "operations.read", "transport.read", "guardian_communication.read"]],
  ["SYSTEM_IN_CHARGE", "System In Charge", "School-level physical systems, facilities, maintenance, and operational readiness within assigned scope.", [...facultyBase, "notice.read", "operations.read", "operations.manage", "approval.read", "transport.read", "transport.manage"]],
  ["SCHOOL_ADMIN", "School Administration Coordinator", "Legacy-compatible school operations role. It has no headquarters policy authority.", [...facultyBase, "attendance.read", "attendance.manage", "notice.read", "notice.manage", "staff.read", "admission.read", "fee.read", "payroll.read", "approval.read", "operations.read"]],
  ["PRINCIPAL", "Principal", "School leader for academics, discipline, faculty supervision, transport, facilities, and daily operations. Finance finalisation remains with COEF.", principalSchoolLeadership],
  ["ACADEMIC_COORDINATOR", "Academic Coordinator", "Academic delivery and examination coordination.", academicManage],
  ["AIC", "Academics In Charge", "Academic delivery, classes, coursework, examinations, and academic staff coordination.", [...academicManage, "school.read", "branch.read", "staff.read", "guardian_communication.read", "guardian_communication.manage"]],
  ["HOD", "Head of Department", "Department academic leadership with controlled fee collection acknowledgement. COEF and Administration retain settlement authority.", [...academicManage, "school.read", "branch.read", "staff.read", "fee.read", "fee.collect.provisional", "PAYMENT_COLLECT", "TC_REQUEST_CREATE"]],
  ["COEF", "Controller of Finance and Examination", "Admissions and re-admissions, examinations, fee-custody verification, and school-bank submission within assigned scope. Central Administration retains final receipt settlement.", coefFinanceAndExaminations],
  ["COE", "Controller of Operations", "School operations, staffing visibility, facilities, and transport execution within assigned scope; policy exceptions are submitted to headquarters.", [...facultyBase, "operations.read", "operations.manage", "approval.read", "staff.read", "attendance.read", "attendance.manage", "transport.read", "transport.manage"]],
  ["GCI", "Guardian Communication In Charge", "Teaching faculty with guardian communication, fee follow-up, and audited guardian collection acknowledgement/custody handover within assigned scope. COEF verifies custody and handles bank submission.", gciTeachingAndGuardianLiaison],
  ["CLASS_TEACHER", "Class Teacher", "Teaching, attendance, coursework, marks, and behaviour reporting within assigned class scope.", teachingDelivery],
  ["SUBJECT_TEACHER", "Subject Teacher", "Teaching, coursework, marks, and behaviour reporting within assigned class scope.", teachingDelivery],
  ["TEACHER", "Teacher", "Teaching, attendance, homework, marks, and behaviour reporting within assigned scope.", teachingDelivery],
  ["ADMISSIONS_OFFICER", "Admissions Officer", "Admission applications, tests, student onboarding, and first-time account activation.", ["panel.access", "dashboard.read", "admission.read", "admission.manage", "student.read", "student.manage", "student_account.manage", "fee.read", "STUDENT_ADMISSION_CREATE"]],
  ["ACCOUNTANT", "Accountant", "Fee, receipt, and finance operations.", ["panel.access", "dashboard.read", "fee.read", "fee.manage", "payroll.read", "payroll.manage", "student.read", "admission.read"]],
  ["HR_OFFICER", "HR Officer", "Faculty and employee operations.", ["panel.access", "dashboard.read", "user.read", "user.manage", "staff.read", "staff.manage", "attendance.read", "attendance.manage"]],
  ["TRANSPORT_MANAGER", "Transport Manager", "Transport fleet and route operations.", ["panel.access", "dashboard.read", "transport.read", "transport.manage", "student.read"]],
  ["GUARDIAN", "Guardian", "Read-only access to linked learner information.", ["panel.access", "student.read", "homework.read", "attendance.read", "exam.read", "fee.read", "notice.read"]],
  ["STUDENT", "Student", "Read-only access to assigned academic information.", ["panel.access", "homework.read", "attendance.read", "exam.read", "notice.read"]],
];

async function main() {
  const [existingPermissions, existingRoles] = await Promise.all([
    prisma.accessPermission.findMany({ select: { code: true } }),
    prisma.accessRole.findMany({ select: { code: true } }),
  ]);

  const existingPermissionCodes = new Set(existingPermissions.map((permission) => permission.code));
  const existingRoleCodes = new Set(existingRoles.map((role) => role.code));
  const missingPermissions = allPermissionCodes.filter((code) => !existingPermissionCodes.has(code));
  const missingRoles = roles.map(([code]) => code).filter((code) => !existingRoleCodes.has(code));

  if (checkOnly) {
    console.log(JSON.stringify({
      ok: missingPermissions.length === 0 && missingRoles.length === 0,
      expectedPermissions: allPermissionCodes.length,
      expectedRoles: roles.length,
      missingPermissions,
      missingRoles,
    }));
    process.exitCode = missingPermissions.length || missingRoles.length ? 1 : 0;
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const [code, name, category, description] of permissions) {
      await tx.accessPermission.upsert({
        where: { code },
        update: { name, category, description, isSystem: true, riskLevel: riskLevelForPermission(code), policyVersion: 1 },
        create: { code, name, category, description, isSystem: true, riskLevel: riskLevelForPermission(code), policyVersion: 1 },
      });
    }

    const storedPermissions = await tx.accessPermission.findMany({
      where: { code: { in: allPermissionCodes } },
      select: { id: true, code: true },
    });
    const permissionIdByCode = new Map(storedPermissions.map((permission) => [permission.code, permission.id]));

    for (const [code, name, description, permissionCodes] of roles) {
      const role = await tx.accessRole.upsert({
        where: { code },
        update: { name, description, isSystem: true, isActive: true },
        create: { code, name, description, isSystem: true, isActive: true },
      });
      await tx.accessRolePermission.deleteMany({ where: { roleId: role.id } });
      await tx.accessRolePermission.createMany({
        data: permissionCodes.map((permissionCode) => ({
          roleId: role.id,
          permissionId: permissionIdByCode.get(permissionCode),
        })),
      });
    }
  }, {
    maxWait: 10_000,
    timeout: 60_000,
  });

  console.log(JSON.stringify({ seededPermissions: allPermissionCodes.length, seededRoles: roles.length }));
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
