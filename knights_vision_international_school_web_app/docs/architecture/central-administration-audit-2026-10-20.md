# SSPS Central Administration Audit

Audited: 2026-10-20  
Scope: `src/app/administration`, `adminPanelKvis`, RBAC/navigation, currently invoked APIs, operations services, and Prisma dependencies.  
Method: static implementation audit. A component is marked **implemented** when its rendered component and invoked API route exist. This is not a substitute for its later role-by-role browser and API acceptance test.

## 1. Route and navigation reality

| Browser route | What is actually rendered | Status | Risk / recommendation |
|---|---|---|---|
| `/administration` | Administration login page. It posts to `/api/auth/login`; panel eligibility is checked in the login API. | Implemented | Keep. Central-role boundary is enforced here. |
| `/administration/adminPanelKvis` | One client layout with a Drawer and `ContentArea` state switch. There are no individual routes for most drawer entries. | Implemented, structurally overloaded | Keep route; replace state-label navigation with a typed central navigation registry. |
| `/administration/adminPanelKvis/page.js` | Dashboard component exists, but the parent layout never renders `children`. | Unused / shadowed | Repair by rendering a real default command-center component through `ContentArea`; do not delete the dashboard before reuse. |
| `ContentArea` default state | Returns the literal string `"<DashboardPage/>"`, not a React component. | Broken | Replace during implementation with the command-center component. |

The Drawer has **496 unique labels**. `ContentArea` has **508 unique switch labels**. All switch states keep the same browser URL; the audit denotes them as `#section=<label>` only to identify the state. The notation is documentation, not a current URL feature.

## 2. Complete navigable page inventory

Dialogs are not separate pages; they are covered by the parent page below. The 425 class-labelled states are represented as parameterized page families because each one invokes the same implementation with a different `className` prop. This covers every current Drawer/ContentArea state without pretending they are individual Next.js routes.

### 2.1 Central and shared pages

| Current labels / component | Actual route | Current functionality inspected | HQ owner | Correct panel | Duplicate / state | Recommendation | Main dependencies / migration risk |
|---|---|---|---|---|---|---|---|
| `Access Control` / `RbacControlPanel` | `/administration/adminPanelKvis#section=Access Control` | Reads RBAC authorization, roles, permissions, users, assignments; can assign roles when `rbac.manage`. | SYSTEM_ADMIN, CTO; CEO oversight | Administration | No duplicate | KEEP | AccessRole, AccessPermission, UserAccessRole, AccessAuditLog; must remain server-authorized. |
| `Add Institution Profile` / `SchoolManagement` | same state route | CRUD UI uses `/api/schools`. | CEO, COO | Administration | No duplicate | KEEP, HARDEN | School model. Current GET/POST lack RBAC and organization filtering. |
| `Add Institution Branches` / `SchoolBranchManagement` | same | CRUD UI uses `/api/school-branches`. | COO | Administration | No duplicate | KEEP, HARDEN | SchoolBranch. POST only checks that any bearer string exists; no verification/scope. |
| `Add Institution Classes`, `Assign Class Teachers` / `SchoolClassManagement` | same | Class CRUD through `/api/school-classes`. | CAO, COO | Administration | Labels share one component | MERGE into **Academic Structure** | SchoolClass, SchoolBranch, User. Current API only checks a bearer is present; no RBAC/scope. |
| `Add Institution Subjects` / `SubjectManagement` | same | Subject CRUD through `/api/subjects`. | CAO | Administration | No duplicate | KEEP, HARDEN | Subject. Unverified bearer check and global list. |
| `Map Class to Subjects` / `ClassSubjectManagement` | same | Class-subject mapping via `/api/class-subjects`. | CAO | Administration | No duplicate | KEEP, HARDEN | ClassSubject. Global read/write and bearer-presence check. |
| `Assign Subject Teachers` / `ClassSubjectTeacherAssignment` | same | Updates class-subject teacher association. | CAO, CHRO | Administration | Related to class/subject mapping | MERGE into **Academic Structure** | ClassSubject, User, assignment data. Must use school/branch scope. |
| `Add Class Rooms` / `RoomManagement` | same | Room CRUD. | COO | Administration | No duplicate | KEEP, HARDEN | Room, SchoolBranch. Require branch scope. |
| `Semester Exams Panel` / `SemesterExamScheduleManagement` | same | Semester schedule configuration. | CAO | Administration | No duplicate | KEEP | Semester schedule data; central policy versus school execution must be separated. |
| `Print Exam Seating Management` / `SemesterExamSeating` | same | Generates/displays seating. | CAO | Administration read/oversight; Faculty execution | Related to dynamic `Exam Seating Cheats` | MERGE into **Assessment Operations** with filters | Exam/seating APIs; eliminate per-class entries. |
| `Prayer & Oaths Selecteds` / `DisplayPrayerAndOath` | same | Class/branch assignment workflow. | CAO policy; school execution | Faculty | No central duplicate | MOVE to Faculty; Administration receives reports only | PrayerOathAssignment; currently a school operational task. |
| `Manage Holiday Calendar` / `HolidayCalendarPage` | same | Holiday CRUD through `/api/holidays`. | COO/CCO | Administration | `Student Holiday Calendar` reads related data | KEEP + MERGE read view | Holiday. Routes are RBAC-protected, but policy ownership must be explicit. |
| `Student Holiday Calendar` / `StudentHolidayCalendar` | same | Student-facing holiday view. | CCO / CAO read | Faculty/Student, not Central | Duplicate presentation of holiday data | MOVE / HIDE from Administration | Holiday API and calendar read model. |
| `Add School Teachers` / `AddTeachingEmployee` | same | Creates teaching employee/user, file upload support. | CHRO | Administration | Related to employee lists | KEEP in **HR Onboarding** | User, file upload. Must centralize role grant after create. |
| `Employee List`, `Faculties List` / `EmployeeInfoList` | same | Same component and user listing. | CHRO | Administration | Exact duplicate labels | MERGE to **Staff Directory** | User, School, SchoolBranch. |
| `Employee Manage List` / `EmployeeManageList` | same | Manage/suspend/ban user UI. | CHRO, SYSTEM_ADMIN | Administration | Related to Staff Directory | MERGE into **Staff Directory** | User; `/api/users` and suspension paths require full RBAC review. |
| Employee/faculty attendance and salary labels / `EmployeeAttendanceLogs`, `EmployeeWiseAttendance`, `EmployeeSalary`, `EmployeePaymentPanel`, entrance/exit components | same | Employee attendance, salary calculation/payment and legacy factory attendance APIs. | CHRO/CFO | Administration for policy and payroll; Faculty for self-service clocking | Several aliases use identical components | MERGE into **HR & Payroll**; MOVE self-service items | User, employee attendance, employee salaries. Several endpoints retain factory/industrial names and legacy models. |
| `My Attendance`, `My Production Logs`, `My Received Salary History`, `My Current Month Salary` | same | Personal employee views. | Individual staff | Faculty (and a small Central personal menu if needed) | Duplicate with attendance/payroll modules | MOVE out of Central main navigation | User/session, payroll/attendance. Central dashboard should not host daily school staff self-service. |
| `Brands` / `Brands` | same | Legacy product brand manager. | None for SSPS governance | Neither | Standalone legacy commercial feature | HIDE from Central navigation | Brand/Product tables; no school governance dependency. |
| `Fleets`, `Depots`, `Vehicle Documents`, `Vehicle Maintenance Logs` | same | Transport inventory, depot, documentation and maintenance CRUD. | COO | Administration policy/oversight; System In-Charge executes scoped work in Faculty | Related fleet pages but not duplicates | KEEP under **Operations & Facilities** | FleetVehicle, depot, documents, maintenance logs. Scope migrations already exist; root record checks still need final audit. |
| `Upload & View Images` / `UploadImagesPanel` | same | R2 file list/upload. | CTO/CMO | Administration | Related to public media panels | KEEP under Technology/Marketing with media permission | Files/R2. Confirm file ownership and scope. |
| `AdminPanel Carousel` / `carousel/SiteHomepageCarousel` | same | Administration dashboard carousel. | CTO/CMO | Administration | Distinct from public site carousel | KEEP only if dashboard needs it | Its model/API must remain separate from public site content. |
| Public site feature labels / `SiteHomePageNavbar`, `SiteFeaturePlatforms`, `website-control-panel/SiteHomepageCarousel`, `SiteCarouselTwo`, `SchoolEnquiry`, `FeatureTechnology`, `FeatureSchoolCenterCities`, `FeatureStudentsResults`, `FeatureSchoolsPrograms`, `KnowledgeTopic` | same | Public website and admissions-content CRUD. `KnowledgeTopic` serves both YouTube and Wiki labels. | CMO; CTO for platform controls | Administration | YouTube/Wiki labels share one component; carousel has two different implementations | MERGE into **Public Website & Campaigns**, retain separate content types | Website content models and public APIs. Must be CMO/CTO permission-scoped. |
| Admission-test labels / application form, application list, admit cards, schedule, syllabus, seating, evaluation, result list, qualified/direct registration, receipts, admitted students | same | Real admission-test workflows invoke admission, fee, student and test APIs. | CMO; CAO for academic test policy; CFO for fee exception | Administration | Several older admission/payment components are unused duplicates | KEEP as **Admissions Pipeline**, MERGE duplicate payment/qualified flows | AdmissionTestApplication, Admission, Student, FeeScheme, payment tables. High migration risk: mixed admission/payment writes must stay idempotent. |
| `🧾 View Fee Schemes` / `FeeSchemes` | same | Fee scheme CRUD. | CFO | Administration | `FeeSchemeManagement` is an unused alternate implementation | KEEP, MERGE alternate | FeeScheme, classes. Current fee routes are among the hardened domains. |
| `📚 Fee Overrides` / `FeeOverrides` | same | Fee override list/manage. | CFO | Administration | `FeeOverrideManagement` is unused alternate implementation | KEEP, MERGE alternate | FeeOverride and audit/idempotency. Must remain approval-routed. |
| `Service Requests & Approvals` / `BrowseServiceRequests` | same | Displays/edits `OperationalRequest`. Current list calls `setRequests(response.data)` although API returns `{ data, total, ... }`; subsequent `.map` is therefore broken. Category is free text and approval has no category routing. | COO/CAO/CFO/CHRO/CMO/CCO/CEO by category | Administration review; Faculty submits | Current single page conflates submit, edit, approve and execution | REPLACE with **Policy Exceptions** workflow, preserve records | OperationalRequest, EnterpriseAuditEvent. Needs decision history, reason, attachments and role routing. |
| `Complaints & Resolutions` / `BrowseComplaints` | same | SchoolConcern list/search/create/update with scoped API. | CCO/COO; faculty handles operational follow-up | Administration oversight + Faculty case handling | Not a policy exception | KEEP under Communications & Compliance, separate from approvals | SchoolConcern, Student, branch/class scope; current UI uses compatibility aliases. |
| `Explore Customers`, `Departments`, `Districts`, `States`, `Taxes`, `Payments`, `Notifications` / Browse* | same | Legacy generic/commerce registry pages. | Only Notifications has an SSPS communication purpose | Mostly neither | Eight unrelated inherited modules | HIDE (Notifications becomes a dedicated notices page after verification) | Customer, legal, sales, tax, payment and generic models; do not expose merely because a component renders. |

### 2.2 Parameterized class page families (all class-labelled states)

The following families appear for **LKG, UKG, I, II, III, IV, V, VI, VII, VIII, IX, X, XS, XI, XII, XIIS and XIIIJ**, subject to a few missing terminal labels. They generate 425 state labels from 25 shared components. They are not 425 independent pages.

| Existing family / component | Current functionality | HQ owner | Correct panel | Duplicate / state | Recommendation | Key risk |
|---|---|---|---|---|---|---|
| Manage Students / `DirectStudents` | Student administration by hard-coded class name. | CAO/CMO policy | Faculty execution; Central filtered oversight | Repeated 17 times | MERGE to one student management page with school, branch, academic year and class filters | Student scope must be derived server-side. |
| Attendance and Leave Requests / `Attendance`, `AttendanceLeaveManagement` | Daily attendance and leave actions. | CAO/CHRO policy | Faculty | Repeated 17 times | MOVE to Faculty, one filterable module | Central needs reports, not daily mutation. |
| Lecture, homework, weekly review, assignments / `SyllabusDailyPlan`, `ClassBiWeeklyReviewPage`, `ClassBiWeeklyAssignmentsPage` | Classroom delivery tracking. | CAO policy | Faculty | Repeated 17 times | MOVE to Faculty, merge filterable course-delivery workspace | Class/teacher scope. |
| Tests, marks, semester results / `ClassBiWeeklyTestsPage`, `ClassSemesterResultsPage`, `DownloadSemesterResultCards` | Marks entry and result viewing. | CAO policy | Faculty execution; Central oversight | Repeated 17 times | MOVE execution to Faculty; Administration gets aggregate assessment governance | Examination write permissions and result publication. |
| Books and study material / `ClassSubjectBooksPage` | Class-specific learning material. | CAO | Faculty | Repeated 17 times | MOVE to Faculty | ClassSubject scope. |
| Behaviour, punishment, food / `DynamicClassStudentBehaviourLogPage`, `DynamicClassPunishmentsPage`, `DynamicClassFoodInstructionsPage` | Student welfare and discipline records. | CAO/CCO policy | Faculty/GCI | Repeated 17 times | MOVE to Faculty; Central sees escalations/aggregate reports | Student PII and guardian communications. |
| Guardian communication, calls, PTM / communication/call/PTM components | Class-level family engagement logs. | CCO/GCI policy | Faculty/GCI | Repeated 17 times; XIIS has typo `GuardianGt;Communication` | MOVE to Faculty, single filtered case-management workspace | Guardian privacy, correct the typo during migration. |
| Monthly fees / `DynamicClassMonthlyFeeManagementSystem` | Class-level fee handling. | CFO policy | Faculty/COEF execution only when authorized | Repeated 17 times | MOVE execution to Faculty; Central retains schemes, exceptions and reconciliation | Fee mutation separation is required. |
| Timetable, admit cards, readmission, transfer certificate, seating / component set | Student transitions and examination documents. | CAO/CMO/CFO by operation | Faculty prepares/submits; Central approves exceptions | Repeated 16–17 times | MERGE to filterable admissions/assessment operations; use Policy Exceptions for non-standard cases | Admissions and certificate records must keep audit history. |
| CDTP/public speaking/annual competition/WB test prep / component set | Enrichment and class programmes. | CAO | Faculty | Repeated 17 times; WB series only some senior classes | MOVE to Faculty; Central retains programme templates and reports | Keep programme data; remove only navigation duplication. |

### 2.3 Labels with no valid destination

There are **39 Drawer labels with no `ContentArea` case**. Selecting them falls through to the broken literal dashboard string. Examples include `All Bus Tracking`, `Attendance Tracking`, `Bus Tracking No.Wise`, `Employee Directory`, `HR Reports`, `Leave Management`, `Payroll Processing`, `Recruitment & Onboarding`, `Shift Scheduling`, `Training & Development`, campaign strategy labels, event labels, `School-wide notices`, `Holiday announcements`, and `Schduled Exam Dates & Times`.

Recommendation: **HIDE** all 39 until a mapped, RBAC-protected replacement is verified. They must not be treated as functional pages.

There are **51 `ContentArea` cases not exposed by the Drawer**, including `Brands`, legacy employee aliases, `Explore Customers/Departments/Taxes`, all `Generate Transfer Certificate <class>` cases, most `Exam Seating Cheats <class>` cases, `Global Factory Employees`, `Work Types`, sales-bonus cases and typo/orphan cases. Recommendation: **HIDE** from the central registry; retain code/data until a replacement is confirmed.

Five switch cases reference identifiers with no import: `GlobalFactoryEmployees`, `MonthlyTotalSalesSalaryAndBonus`, `MyDailyNetSalesBonus`, `MyDailyDetailedSalesBonus`, and `WorkTypes`. If selected, they can throw at runtime. They are not usable Administration pages.

## 3. RBAC, API and database findings

| Area | Finding | Consequence | Required implementation action |
|---|---|---|---|
| Panel boundary | `/api/auth/validate` correctly rejects Faculty users from the Administration panel using `canAccessStaffPanel`. Principal, AIC, COEF, GCI and System In-Charge are not Administration roles. | Correct direction. | Preserve and add role regression tests. |
| Temporary full access | Current Drawer gives SYSTEM_ADMIN/CEO/COO/CFO full legacy navigation solely by role code. The RBAC seed gives COO and CFO `allPermissionCodes` unconditionally. No environment flag exists. | Violates the new production-safety requirement. | Add a server-enforced development flag; default false; never return full legacy navigation in production. Restore normal COO/CFO grants when disabled. |
| API protection | Static inventory: 675 API route files; only 30 contain the current RBAC helper calls. | The Drawer is not a security boundary; many legacy endpoints remain unclassified. | Harden by domain, starting with central navigation endpoints. Do not expose an unprotected page as “central.” |
| School structure APIs | `/api/schools` GET/POST has no RBAC check; `/api/school-branches`, `/api/school-classes`, `/api/subjects`, `/api/class-subjects` mostly only test whether an Authorization header exists. | Cross-organization/branch data exposure and unauthorised mutation risk. | Replace with permission + `buildScopeWhere` checks and record-level guard on all item routes. |
| Approval system | `OperationalRequest` has school/branch/status/decision fields and an append-only EnterpriseAuditEvent on update. It does not store required reason, request type, routed approver, attachments, decision history or execution verification. | Cannot meet central policy-exception governance. | Add explicit policy exception type, route, decision/event and execution records; preserve OperationalRequest data. |
| Approval authorization | Existing request PUT requires `operations.manage` and only tests generic `approval.manage` for APPROVED/REJECTED. It does not route category to CFO/CAO/CHRO/COO/CMO/CCO/CEO. CHRO currently lacks `approval.manage`. | Incorrect approver can decide; intended approver can be blocked. | Separate submission, review, decision and execution permissions plus category-role routing. |
| Request UI | Service Request list expects an array but current API returns an envelope; its edit form permits all statuses, category is free text, and it does not require supporting reason. | Broken/unsafe approval UI. | Replace during approval-system implementation; keep legacy endpoint adapter until data migration finishes. |
| Audit | `EnterpriseAuditEvent` exists and redacts secret-like fields; RBAC changes use AccessAuditLog. | Strong base but no per-request decision timeline. | Add request-specific event rows linked to policy exception IDs. |

## 4. Proposed final Administration navigation

All entries below remain on the single Administration route initially, but are represented by a typed navigation registry. Each registry item has a page key, required permission, central owner, and status. Class/branch/year are filters, not drawer groups.

1. **Executive Command Center** — CEO, SYSTEM_ADMIN. Enterprise snapshot, policy metrics, exception queue, cross-school alerts, audit summary. Replaces broken default dashboard.
2. **Institutions & Branches** — CEO, COO, CAO read. School profile, branches, rooms, academic years, classes, subjects, class/teacher assignment.
3. **Human Resources** — CHRO, CFO read, CEO. Staff directory, onboarding, role assignment gateway, employment status, payroll policy and workforce reports. Personal attendance/salary moves to Faculty.
4. **Academic Governance** — CAO, CEO. Curriculum/subjects, academic calendar, examination policy, timetable standards, assessment results oversight. Daily class delivery moves to Faculty.
5. **Finance & Accounting** — CFO, CEO. Fee schemes, approved overrides, payment/reconciliation reports, payroll approval. Class fee collection is faculty execution only where separately authorized.
6. **Requests & Approvals** — Routed central decision workspace. Faculty submits policy exceptions; central authority verifies, decides, and confirms execution.
7. **Admissions & Marketing** — CMO, CAO/CFO as required. Admission pipeline, test configuration, applications, evaluation, seats/results, conversion, enquiries, public campaigns.
8. **Operations & Facilities** — COO. Transport, depots, documents, maintenance, facilities, holidays, operational reports. Faculty/SIC executes scoped tasks in Faculty.
9. **Communications & Compliance** — CCO, CCA. Notices, guardian communication policy, concerns/complaints oversight, compliance/audit review.
10. **Technology & Security** — SYSTEM_ADMIN, CTO. Access control, audit events, media/platform configuration, public website technical controls, integration/data health.

## 5. Central approval-system design

### Request categories and sole decision authority

| Category | Central decision role | Faculty submitters | Examples |
|---|---|---|---|
| FINANCIAL | CFO | Principal, COEF | fee waiver, refund, exceptional payment plan, payroll exception |
| ACADEMIC | CAO | Principal, AIC | curriculum exception, examination exception, academic calendar deviation |
| STAFF | CHRO | Principal, System In-Charge | appointment, transfer, disciplinary/staffing exception |
| OPERATIONAL | COO | Principal, System In-Charge, COEF | facility, transport, procurement, operational policy exception |
| MARKETING | CMO | Principal/GCI when assigned | campaign, public admission promotion, event branding |
| COMMUNICATIONS | CCO | GCI, Principal | public notice policy, guardian communication exception |
| EXECUTIVE | CEO | Central officers | reserved major decision or cross-domain escalation |

SYSTEM_ADMIN may administer the platform but should not silently bypass a business decision in production. CEO may decide executive escalations. Principal, COEF, GCI, AIC and System In-Charge can submit and execute an already-approved request, but cannot decide headquarters-controlled changes.

### Required workflow

`DRAFT -> SUBMITTED -> UNDER_REVIEW -> APPROVED or REJECTED -> EXECUTION_VERIFIED -> CLOSED`

Every submission needs: category, title, required reason, requested change payload, school/branch scope, target academic year/class when relevant, and supporting file references. The system records routed role, assigned reviewer, every state transition, decision reason, author, timestamp and authorized execution result. Rejection/cancellation remains immutable history, not deletion.

## 6. Proposed implementation sequence after approval

1. Replace the legacy Drawer arrays with the ten-group registry; retain a compatibility label adapter so old internal links do not break.
2. Repair the default command-center render and hide the 39 unmatched labels plus legacy commercial pages from the registry only.
3. Add the server-side development flag for temporary full legacy navigation. Ensure production is always false; keep API permission checks independent.
4. Harden the central navigation APIs by domain before exposing them: institutions, HR, academic, finance, admissions, operations, communications, technology.
5. Add the policy-exception schema and workflow alongside `OperationalRequest`, migrate/adapter-map legacy operational records, then replace the broken request UI.
6. Move only the class-delivery registry entries to the Faculty panel after its existing filtered components have been checked. Do not delete the shared component implementations.
7. Test central roles, Faculty exclusion, scopes, workflow routing/audit, and every retained navigation key.

## 7. Non-negotiable migration safeguards

- No destructive deletion of current pages, APIs or records in this phase.
- Navigation hide/move is reversible; old state labels remain adapter-mapped until compatibility tests pass.
- Existing `School`, `SchoolBranch`, `SchoolClass`, `Student`, `User`, fee, admission and transport records are retained.
- Database changes are additive migrations with backfill and rollback notes.
- No frontend role check substitutes for API permission, panel-session and record-scope validation.

## 8. Implementation record — 2026-10-20

Completed in this implementation pass:

- Replaced the active Administration Drawer source with the approved ten-group Central Administration registry. The legacy 496-label arrays and class-labelled implementations remain in source for compatibility, but are no longer exposed in Central Administration.
- Repaired the Administration default view with `CentralCommandCenter`; `ContentArea` no longer renders the literal `"<DashboardPage/>"` string.
- Added a production-safe, server-derived temporary full-navigation feature flag. It is disabled unless `SSPS_ENABLE_TEMPORARY_FULL_ADMIN_ACCESS=true` in a non-production environment. It affects navigation only; APIs continue to enforce permissions and scope.
- Added `approval.submit` and granted submission access to scoped Faculty and headquarters roles. CHRO now has the corresponding central decision permission for staff matters.
- Added the additive `PolicyException` and `PolicyExceptionEvent` schema/migration, plus API workflow and audit trail. Category routing is fixed: FINANCIAL→CFO, ACADEMIC→CAO, STAFF→CHRO, OPERATIONAL→COO, MARKETING→CMO, COMMUNICATIONS→CCO, EXECUTIVE→CEO.
- Added the shared Policy Exceptions workspace to Administration and the Faculty Panel. Faculty can submit and view their own scoped requests; only the routed headquarters role can make a decision. Only the original submitter can verify execution after approval.
- Hardened the collection routes for `/api/schools`, `/api/school-branches`, `/api/school-classes`, `/api/subjects`, `/api/class-subjects`, and `/api/rooms`, plus the class-subject and room item routes, with server-side permissions and resource scope checks while retaining their legacy response envelopes.

Verified:

- Prisma schema validation passed and migration `20261020090000_add_policy_exception_workflow` was applied to `suresuccesspointschool-db`.
- Prisma client regenerated successfully.
- RBAC seed/check passed with 45 permissions and 27 roles.
- Root central account received 200 responses from the RBAC and policy-exception APIs; each hardened configuration collection returned 200 when authenticated and 401 without a session.
- `next lint` passed with only pre-existing warnings. Repository-wide TypeScript still reports known legacy route-signature and selector-prop errors outside this pass; no errors were reported for the new policy-exception, navigation, or hardened configuration files.

Remaining sequencing work:

- Migrate the duplicated Faculty class-navigation arrays to filtered reusable workspaces, then remove only the unused aliases after route-by-route compatibility testing.
- Continue the same hardening pattern over the remaining legacy configuration item endpoints and the long-tail website/HR APIs. The 675-route legacy inventory must be closed domain-by-domain; navigation visibility is not a security substitute.

## 9. Faculty finance custody workflow — 2026-10-20

The finalized Faculty Drawer already contained the shared **Payments Proceeded (GCI → COEF Verification)** section. It is now backed by a deliberately separated workflow rather than direct fee mutation:

`GCI collects → provisional guardian acknowledgement → GCI records handover to COEF → COEF verifies/rejects → final MonthlyFeePayment and receipt`

- GCI has teaching permissions, guardian-communication permissions, `fee.read`, and `fee.collect.provisional`. It cannot use `fee.manage` or `fee.verify`.
- A collection begins as `PENDING_HANDOVER`; it is not posted to `MonthlyFee` or `MonthlyFeePayment`, and is not a final receipt.
- The collecting GCI alone can mark their own record `HANDED_OVER`, with a timestamp, optional handover note, scope check, and audit event.
- Only a scoped COEF with `fee.verify` can verify/reject a handed-over record. Verification locks the ledger row, rechecks the outstanding balance/reference, posts one final `MonthlyFeePayment`, and updates the fee status atomically. Rejection never alters the ledger.
- GCI’s provisional acknowledgement number is visible to staff and guardian. The final ledger receipt number appears only after COEF verification.
- SYSTEM_ADMIN remains technically separate, with audited inspection/maintenance access. It is not treated as a school-finance handover or COEF verification actor.

The additive migrations are `20261020110000_add_provisional_fee_collection_workflow`, `20261020113000_add_provisional_fee_handover_chain`, and `20261020113100_set_provisional_fee_handover_default`.

## 10. GCI Guardian & Student Care consolidation — 2026-10-20

The GCI Faculty Drawer no longer exposes separate **Wellbeing Insights** and **Fees & GC** groups for every class. It now exposes one **Guardian & Student Care — Class <class>** workspace for each class.

- The workspace preserves and merges legacy guardian communication, guardian calls, and PTM notes into a single chronological care timeline; no legacy records or APIs were deleted.
- It shows the selected student’s guardian contacts, behavioural/wellbeing history, and fee-follow-up status in the same class-scoped page.
- New `GuardianStudentSpecialNote` records provide private, auditable, priority-labelled student/guardian notes. The scoped GCI can create and resolve them; all reads and writes derive class, school, and branch ownership server-side.
- The new page uses `guardian_communication.read/manage`; it does not grant fee finalisation or cross-branch access.
