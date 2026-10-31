/**
 * Canonical Central Administration information architecture.
 *
 * Drawer labels are deliberately plain text. They are also the ContentArea
 * dispatch keys, so keeping them ASCII prevents a copied emoji or an encoding
 * conversion from creating a dead navigation item.
 */
export const centralAdministrationGroups = [
  {
    title: "Executive Command Center",
    items: [
      { label: "Executive Command Center", permission: "dashboard.read" },
      { label: "Access Control", permission: "rbac.read" },
    ],
  },
  {
    title: "Institutions & Branches",
    items: [
      { label: "Add Institution Profile", permission: "school.manage" },
      { label: "Add Institution Branches", permission: "branch.manage" },
      { label: "Manage Classes & Class Teachers", permission: "class.manage" },
      { label: "Add Institution Subjects", permission: "class.manage" },
      { label: "Map Class to Subjects", permission: "class.manage" },
      { label: "Assign Subject Teachers", permission: "class.manage" },
      { label: "Add Class Rooms", permission: "class.manage" },
    ],
  },
  {
    title: "Human Resources",
    items: [
      { label: "Add School Teachers", permission: "staff.manage" },
      { label: "Workforce Directory", permission: "staff.read" },
      { label: "Employee Documents", permission: "staff.read" },
      { label: "Faculty Attendance", permission: "attendance.read" },
    ],
  },
  {
    title: "Academic Governance",
    items: [
      { label: "Manage Holiday Calendar", permission: "notice.manage" },
      { label: "Semester Exams Panel", permission: "exam.manage" },
      { label: "Print Exam Seating Management", permission: "exam.manage" },
    ],
  },
  {
    title: "Finance & Accounting",
    items: [
      { label: "Manage Fee Schemes", permission: "fee.read" },
      { label: "Monthly Fee - Daily Bank Settlement", permission: "fee.receive" },
      { label: "Admission Fee - Bank Credit Confirmation", permission: "fee.receive" },
      { label: "Faculty Payroll", permission: "payroll.read" },
    ],
  },
  {
    title: "Requests & Approvals",
    items: [
      { label: "Policy Exceptions", permission: "approval.read" },
      { label: "Operational Requests", permission: "operations.read" },
    ],
  },
  {
    title: "Admissions & Marketing",
    items: [
      { label: "Admission Applications", permission: "admission.read" },
      { label: "Create Admission Application", permission: "admission.manage" },
      { label: "Admission Test Admit Cards", permission: "admission.read" },
      { label: "Admission Test Schedule", permission: "admission.manage" },
      { label: "Admission Test Seating", permission: "admission.read" },
      { label: "Admission Test Subjects & Syllabus", permission: "admission.read" },
      { label: "Admission Test Evaluation", permission: "admission.manage" },
      { label: "Admission Test Results & Rank", permission: "admission.read" },
      { label: "Register Qualified Applicants", permission: "admission.manage" },
      { label: "Direct Admission Registration", permission: "admission.manage" },
      { label: "Admission Forms & Receipts", permission: "admission.read" },
      { label: "Admitted Students", permission: "admission.read" },
      { label: "Explore Enquiries", permission: "website.manage" },
      { label: "Manage Feature Platforms", permission: "website.manage" },
      { label: "Manage Featured Programs", permission: "website.manage" },
    ],
  },
  {
    title: "Operations & Facilities",
    items: [
      { label: "Fleets", permission: "transport.manage" },
      { label: "Depots", permission: "transport.manage" },
      { label: "Vehicle Documents", permission: "transport.manage" },
      { label: "Vehicle Maintenance Logs", permission: "transport.manage" },
    ],
  },
  {
    title: "Communications & Compliance",
    items: [
      { label: "Complaints & Resolutions", permission: "guardian_communication.read" },
      { label: "Modify Site Navbar", permission: "website.manage" },
      { label: "Modify Site Carousel", permission: "website.manage" },
      { label: "Modify Achievements Carousel", permission: "website.manage" },
    ],
  },
  {
    title: "Technology & Security",
    items: [
      { label: "Upload & View Images", permission: "media.manage" },
      { label: "School Evidence Review", permission: "evidence.read" },
      { label: "AdminPanel Carousel", permission: "website.manage" },
    ],
  },
];
