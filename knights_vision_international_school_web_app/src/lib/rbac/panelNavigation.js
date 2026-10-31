/**
 * Panel navigation is a convenience layer only.  The corresponding API still
 * performs the authoritative permission and scope check for every request.
 *
 * Keeping these rules in one place prevents the Administration and Faculty
 * drawers from slowly diverging as new RBAC roles are introduced.
 */
const exactPermissions = {
  "Access Control": "rbac.read",
  "My Profile": "panel.access",
  "My Attendance": "attendance.read",
  "My Production Logs": "staff.read",
  "My Salary History": "payroll.read",
  "My Received Salary History": "payroll.read",
  "My Current Month Salary": "payroll.read",

  "Add School Teachers": "staff.manage",
  "Employee List": "staff.read",
  "Faculties List": "staff.read",
  "Employee Manage List": "staff.manage",
  "Insert Faculty Entrance": "attendance.manage",
  "Insert Faculty Exit": "attendance.manage",
  "Faculty Attendance": "attendance.read",
  "View Faculty Attendance & Salary": "payroll.read",
  "Faculty Monthly Salary": "payroll.manage",
  "Faculty Payment Panel": "payroll.manage",

  "Add Institution Profile": "school.manage",
  "Add Institution Branches": "branch.manage",
  "Add Institution Classes": "class.manage",
  "View Institution Classes": "class.read",
  "Add Institution Subjects": "class.manage",
  "Preview Class to Subjects": "class.read",
  "Map Class to Subjects": "class.manage",
  "Assign Class Teachers": "class.manage",
  "Assign Subject Teachers": "class.manage",
  "Add Class Rooms": "class.manage",
  "Manage Holiday Calendar": "notice.manage",
  "Student Holiday Calendar": "notice.read",
  "Institution Holiday Calendar": "notice.read",

  "Semester Exams Panel": "exam.manage",
  "Print Exam Seating Management": "exam.manage",
  "Prayer & Oaths Selecteds": "notice.read",

  "🧾 View Fee Schemes": "fee.read",
  "🧾 Admission Test Applications": "admission.read",
  "📝 Fill Admission Form": "admission.manage",
  "📥 Download Admit Card": "admission.read",
  "📚 Admission Test Schedule": "admission.manage",
  "📚 Print Application & Room No": "admission.read",
  "🧠 Syllabus & Subject Info": "admission.read",
  "🧪 Test Evaluation & Mark Entry": ["admission.manage", "exam.manage"],
  "📊 View Result & Rank List": ["admission.read", "exam.read"],
  "📋 KSAT Qualifieds Registration": "admission.manage",
  "📋 General Direct Registration": "admission.manage",
  "📄 Form ID & Fee Receipt": "admission.read",
  "✅ Total Admitted Students": "admission.read",

  "Fleets": "transport.manage",
  "Depots": "transport.manage",
  "Vehicle Documents": "transport.manage",
  "Vehicle Maintenance Logs": "transport.manage",

  "Upload & View Images": "media.manage",
  "School Evidence Submission": "evidence.submit",
  "School Evidence Review": "evidence.read",
  "AdminPanel Carousel": "website.manage",
  "Modify Feature Galaxies": "website.manage",
  "Modify Site Navbar": "website.manage",
  "Modify Site Carousel": "website.manage",
  "Modify Achievements Carousel": "website.manage",
  "Explore Enquaries": "website.manage",
  "Modify Feature Technologies": "website.manage",
  "Modify School in Cities": "website.manage",
  "Modify Feature Students": "website.manage",
  "Modify Feature YT Videos": "website.manage",
  "Modify Featured Programs": "website.manage",
  "Modify WikiGalaxy Articles": "website.manage",
  "Explore Notifications": "notice.manage",

  "Service Requests & Approvals": "approval.manage",
  "Submit Policy Exception": "approval.submit",
  "Policy Exceptions": "approval.read",
  "Operational Requests": "operations.read",
  "Complaints & Resolutions": "operations.manage",

  // The same monthly register is visible to GCI and COEF. The APIs, not menu
  // visibility, enforce who may collect, approve, submit to bank, or receive.
  "Payments Proceeded": "fee.read",
  // Hidden aliases keep an already-open legacy panel selection compatible.
  "Payments Proceeded Today": "fee.read",
  "Payments Proceeded This Week": "fee.read",
  "Payments Proceeded Full Month": "fee.read",
  "Pending COEF Verification": "fee.read",
  "Verified & Submitted to Accounts": "fee.read",
  // Front-desk admissions use the lifecycle API. The specific permission is
  // intentionally separate from the legacy admission-test module.
  "Admission Fee Custody": "fee.read",
  "Admission Fee Verification": "fee.read",
  // GCI sees one consolidated workspace per class. The API still derives its
  // class/branch scope from the selected server-side school class.
  "GCI Class Information LKG": "guardian_communication.manage",
  "GCI Class Information UKG": "guardian_communication.manage",
  "GCI Class Information I": "guardian_communication.manage",
  "GCI Class Information II": "guardian_communication.manage",
  "GCI Class Information III": "guardian_communication.manage",
  "GCI Class Information IV": "guardian_communication.manage",
  "GCI Class Information V": "guardian_communication.manage",
  "GCI Class Information VI": "guardian_communication.manage",
  "GCI Class Information VII": "guardian_communication.manage",
  "GCI Class Information VIII": "guardian_communication.manage",
  "GCI Class Information IX": "guardian_communication.manage",
  "GCI Class Information X": "guardian_communication.manage",
  "GCI Class Information XS": "guardian_communication.manage",
  "GCI Class Information XI": "guardian_communication.manage",
  "GCI Class Information XII": "guardian_communication.manage",
  "GCI Class Information XIIS": "guardian_communication.manage",
  "GCI Class Information XIIIJ": "guardian_communication.manage",
};

const readPrefixes = /^(View|Preview|Check|Download|Explore|Print|My |Institution Holiday)/i;

function readOrManage(label, readPermission, managePermission) {
  return readPrefixes.test(label) ? readPermission : managePermission;
}

export function getPanelItemPermission(label) {
  if (exactPermissions[label]) return exactPermissions[label];

  // GCI's class fee overview is deliberately read-only. Any collection is
  // recorded through the separate provisional handover workflow, and COEF is
  // the only role that can create the final receipt/ledger entry.
  if (/^Monthly Fees (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.test(label)) {
    return "fee.read";
  }
  // Both GCI and COEF may open the retained class payment interface. The
  // component/API make it read-only unless the actor has fee.manage.
  if (/^Monthly Fees Class (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XS|XI|XII|XIIS|XIIIJ)$/.test(label)) {
    return "fee.read";
  }
  if (/^New Admission (LKG|UKG|I|II|III|IV|V|VI|VII|VIII|IX|X|XI|XII)$/.test(label)) {
    return "STUDENT_ADMISSION_CREATE";
  }
  if (/Guardian Communication|Parent-Teacher/i.test(label)) {
    return readOrManage(label, "guardian_communication.read", "guardian_communication.manage");
  }
  if (/Student Account|Activation/i.test(label)) return "student_account.manage";
  if (/Salary|Payroll|Payment Panel/i.test(label)) return readOrManage(label, "payroll.read", "payroll.manage");
  if (/Fee|Receipt|Payment/i.test(label)) return readOrManage(label, "fee.read", "fee.manage");
  if (/Admission|Admit Card|Direct Admission|ReAdmission/i.test(label)) {
    return readOrManage(label, "admission.read", "admission.manage");
  }
  if (/Attendance|Leave Request/i.test(label)) {
    return readOrManage(label, "attendance.read", "attendance.manage");
  }
  if (/Homework|Lecture|Syllabus|Assignment|Instructed Books/i.test(label)) {
    return readOrManage(label, "homework.read", "homework.manage");
  }
  if (/Exam|Test|Marks|Result|Seating/i.test(label)) {
    return readOrManage(label, "exam.read", "exam.manage");
  }
  if (/Student|Transfer Certificate|Behaviour|Punishment|Healthy Foods|Yoga|LifeStyles/i.test(label)) {
    return readOrManage(label, "student.read", "student.manage");
  }
  if (/School|Institution|Branch|Class Room|Subjects|Class Teachers|Subject Teachers/i.test(label)) {
    return readOrManage(label, "school.read", "school.manage");
  }
  if (/Faculty|Employee|HR|Training/i.test(label)) {
    return readOrManage(label, "staff.read", "staff.manage");
  }
  if (/Carousel|Navbar|Feature|Website|Enquar|Marketing|Campaign|Lead/i.test(label)) {
    return readOrManage(label, "website.read", "website.manage");
  }
  if (/Image|Media/i.test(label)) return readOrManage(label, "media.read", "media.manage");
  if (/Fleet|Vehicle|Depot|Bus/i.test(label)) return readOrManage(label, "transport.read", "transport.manage");
  if (/Notice|Circular|Holiday/i.test(label)) return readOrManage(label, "notice.read", "notice.manage");
  if (/Operations|Facility|Infrastructure|Complaint/i.test(label)) {
    return readOrManage(label, "operations.read", "operations.manage");
  }
  if (/Approval|Service Request/i.test(label)) {
    return readOrManage(label, "approval.read", "approval.manage");
  }

  // Unclassified legacy entries remain hidden for RBAC-aware sessions instead
  // of navigating a user to ContentArea's default screen.
  return null;
}

function hasPermission(permissionSet, permission) {
  if (!permission) return false;
  if (Array.isArray(permission)) return permission.some((entry) => hasPermission(permissionSet, entry));
  return permissionSet.has("*") || permissionSet.has(permission);
}

export function filterPanelGroups(groups, permissions) {
  // Do not break an older deployment which has not yet returned the RBAC
  // authorization object. Once permissions are present, fail closed for
  // unclassified items.
  if (!Array.isArray(permissions)) return groups;

  const permissionSet = new Set(permissions);

  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => hasPermission(permissionSet, item.permission || getPanelItemPermission(item.label))),
    }))
    .filter((group) => group.items.length > 0);
}
