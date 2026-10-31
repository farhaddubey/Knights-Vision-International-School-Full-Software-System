# Phase 1: Enterprise School Group Architecture

**Status:** Draft for review  
**System:** Sure Success Point School  
**Scope:** Architecture, governance, data-domain design, and staged delivery only  
**Implementation authority:** No schema, API, UI, or production-data change is permitted until this Phase 1 design is approved.

## 1. Objective

Evolve the current school application into an enterprise platform that can safely operate one or more school groups, legal organizations, regions, branches, departments, classes, staff, students, guardians, academic sessions, finance operations, and compliance workflows.

The target must preserve the existing Sure Success Point School experience while making authorization, delegation, approvals, and auditability explicit. The system must be safe for sensitive education, finance, examination, and guardian data.

## 2. Principles and non-negotiable rules

| Principle | Architecture rule |
| --- | --- |
| Incremental evolution | Extend the existing PostgreSQL/Prisma foundation; do not replace live data or rebuild the panels in one release. |
| Tenant and scope isolation | Every protected record is owned by an organization and, where relevant, by a region, branch, department, class, session, or student. Queries must enforce that scope. |
| Deny by default | A successful login is not permission. Every API action needs an explicit permission and an allowed scope. |
| Least privilege | Job title, panel access, permissions, and approval authority are separate assignments. |
| Separation of duties | The person who prepares a sensitive action cannot approve it when policy requires independent approval. |
| Immutable accountability | Security, approvals, role changes, fee adjustments, marks publication, and exports produce append-only audit events. |
| Backward compatibility | Existing identifiers, routes, integrations, and user experience are preserved behind compatibility adapters during migration. |
| Security by design | No Aadhaar/UID-derived credentials. Student and guardian account activation uses a verified invitation, an expiring one-time link/OTP, and a user-chosen password. |

## 3. Current foundation and target hierarchy

The current schema already provides `School`, `SchoolBranch`, `SchoolClass`, `Student`, `Department`, `User`, role, permission, and access-audit concepts. These remain the Phase 2 migration foundation.

```text
School Group (optional parent / holding group)
└── Organization / Legal School Entity
    └── Region / Cluster (optional)
        └── Branch / Campus
            ├── Department
            │   └── Staff assignment / responsibility
            └── Academic Session
                └── Class / Section
                    ├── Subject and timetable
                    ├── Student enrollment
                    └── Guardian relationship
```

### Current-to-target mapping

| Existing concept | Target role | Migration rule |
| --- | --- | --- |
| `School` | Organization during the first migration | Preserve its primary key and business data. Add a non-breaking organization layer rather than renaming live tables. |
| `SchoolBranch` | Branch/Campus | Keep existing branch ownership and add regional linkage only when used. |
| `SchoolClass` | Class/Section in an academic session | Continue existing class behaviour; make session, branch, and ownership mandatory for new data. |
| `Department` | Branch or organization department | Add explicit organization/branch scope and leadership assignments incrementally. |
| `User` | Human identity | Do not duplicate an identity for each role or branch. Use assignments and scopes. |
| `AccessRole`, `UserAccessRole`, permissions | RBAC foundation | Retain compatibility; introduce versioned permission codes and scoped assignments alongside them. |
| `AccessAuditLog` | Audit foundation | Preserve current logs and add structured enterprise audit events for new modules. |

## 4. Module dependency map

The target is a modular monolith first. The current Next.js/MUI + PostgreSQL/Prisma system remains the running platform. A Spring Boot service boundary is a proposed future backend option, not an approved replacement; it must be explicitly approved before Phase 2 implementation.

```text
Identity, Sessions and Scoped RBAC
        │
        ├── Organization and Scope Registry ──┬── Workforce
        │                                     ├── Academics
        │                                     ├── Student and Guardian
        │                                     ├── Finance
        │                                     ├── Examination
        │                                     └── Communications
        │
        ├── Approval, Delegation and Audit ───── applies policy to all modules
        └── Reporting and Export ─────────────── reads approved scoped data only
```

| Bounded module | Owns | May depend on | Must not own |
| --- | --- | --- | --- |
| Organization and scope registry | Groups, organizations, regions, branches, academic sessions, departments, scope relationships | Identity | Marks, fees, attendance, credentials |
| Identity, sessions and RBAC | User identities, sessions, roles, permissions, scoped assignments, panel access | Organization scopes | Student academic records or finance rules |
| Workforce | Employee profile, designation, appointment, staff-to-class/subject responsibility | Identity, organization, approval | Credentials or permission definitions |
| Academics | Classes, subjects, timetables, homework, attendance, learning materials | Organization, workforce, student | Fee ledger or identity secrets |
| Student and guardian | Student profile, enrollment, guardianship, account invitation and consent | Identity, organization, academics | Marks policy or payment settlement |
| Examination | Assessment, marks, moderation, result publication | Academics, workforce, approval | General user administration |
| Finance | Fee plans, invoices, concessions, payments, refunds, reconciliation | Student, organization, approval | Exam publication or login roles |
| Communications | Notice targeting, delivery attempts, guardian consent, templates | Identity, student, workforce | Authorization decisions |
| Approval, delegation and audit | Requests, policy versions, approvers, delegations, immutable audit evidence | Identity, organization | Domain business data itself |
| Reporting and export | Read models, aggregated metrics, export jobs | All modules through approved read contracts | Direct writes to source modules |

### Dependency rules

1. A module exposes commands and read contracts; another module does not write directly to its tables.
2. Domain events are durable records, not fire-and-forget browser actions. Examples: `student.enrolled`, `fee.payment.recorded`, `marks.submitted`, `approval.approved`.
3. Exports are asynchronous, permission checked, watermarked where necessary, and audited.
4. External mobile apps use the same authorization contracts as the web panels; they never receive database credentials or broad administrator tokens.

## 5. Identity, panel, role, permission, and scope model

### 5.1 Separate the four concerns

| Concern | Meaning | Example |
| --- | --- | --- |
| Identity | Who is acting | One staff member or one guardian/student account |
| Panel entitlement | Which interface may be entered | Administration, Faculties, Students/Guardian |
| Permission | Which verb may be used | `attendance.write`, `fees.refund.request`, `results.publish` |
| Scope | Which records may be affected | One branch, department, class, subject, or own student relationship |

A job title is not a permission. `COE`, `COEF`, `GCI`, `AIC`, Principal, System In Charge, class teacher, and subject teacher are staff responsibility assignments. Their permissions are issued by role templates plus explicit scoped assignments.

### 5.2 Panel admission policy

| Panel | Admission policy | Notes |
| --- | --- | --- |
| Administration | Explicit administrative entitlement plus valid scoped role | Administrative work only. It is not a default staff panel. |
| Faculties | Any active, assigned, non-student staff identity | The actual navigation and APIs are filtered by permissions and scope. This permits administrative staff who teach or operationally manage work to use faculty tools. |
| Students/Guardian | Student/guardian entitlement and relationship to the record | No access to staff or administration panels. |

Panel sessions are panel-bound. A token/session minted for one panel cannot authorize another panel. A user who has both Administration and Faculties entitlement must enter each panel through its own session flow.

### 5.3 Scope hierarchy

```text
GROUP
  └── ORGANIZATION
       └── REGION
            └── BRANCH
                 └── DEPARTMENT
                      └── CLASS / SECTION
                           └── SUBJECT / STUDENT RELATIONSHIP
```

Scope inheritance is downward only. A class teacher assigned to a class cannot read another class because they share a branch. A central role does not bypass branch-level approval policy unless the role has an explicit central permission and scope.

### 5.4 Required authorization algorithm

Every protected server-side command follows this order:

```text
authenticate session
→ validate expected panel
→ resolve active identity
→ resolve active role assignments at the action date
→ test permission code
→ test resource ownership and scope
→ test workflow state / approval requirement
→ execute transaction
→ append audit event
```

Never trust a role, branch ID, class ID, student ID, or permission supplied by the browser without server-side resolution.

### 5.5 Core permission families

| Family | Examples |
| --- | --- |
| Organization | `organization.read`, `branch.manage`, `department.manage`, `session.manage` |
| Workforce | `staff.read`, `staff.assign`, `staff.role.assign`, `staff.invite` |
| Academics | `class.read`, `timetable.manage`, `attendance.read`, `attendance.write`, `homework.publish` |
| Student/guardian | `student.read`, `student.update`, `guardian.manage`, `student.account.invite` |
| Examination | `assessment.manage`, `marks.enter`, `marks.moderate`, `results.publish` |
| Finance | `fees.plan.manage`, `invoice.issue`, `payment.record`, `concession.request`, `refund.approve` |
| Communications | `notice.publish`, `guardian.message.send`, `template.manage` |
| Governance | `approval.request`, `approval.review`, `delegation.manage`, `audit.read`, `export.run` |

Permission codes are versioned, stable strings. UI menu visibility is convenience only; the API policy engine is authoritative.

## 6. Role design

### Central and organization governance roles

| Role | Normal scope | Primary responsibility | Restricted actions |
| --- | --- | --- | --- |
| Group Administrator | Group | Group structure and group-level policy | Cannot approve own high-risk changes |
| Organization Administrator | Organization | Organization configuration and staff governance | Cannot cross organization boundary |
| Principal | Organization or branch | Leadership, operations oversight, final academic oversight | Finance approval only where policy grants it |
| System In Charge (SIC) | Organization/branch | System operations, support, access requests | Does not receive finance or marks approval automatically |
| AIC | Branch/academics | Academic planning and teacher workflows | Only assigned academic scope |
| COE | Branch/examination | Exam setup, moderation coordination, result release requests | Publication requires configured approval |
| COEF | Branch/finance/examination | Financial and examination control | Segregated from self-approval |
| GCI | Branch/guardian communication | Guardian communication, response workflow, consent-aware notices | No unrestricted student finance or academic edits |

### Faculty roles

| Role | Normal scope | Typical permissions |
| --- | --- | --- |
| Class Teacher | Assigned class/section | Class attendance, guardian communication for class, class homework, contextual student reads |
| Subject Teacher | Assigned subject/class | Subject homework, assessment entry, learning material, subject attendance where policy permits |
| Teacher | Assigned branch/department | Limited approved academic tasks; no implied cross-class editing |
| Faculty Coordinator | Assigned department/branch | Review and schedule coordination, not unconditional publication |

### Student and guardian roles

Student/guardian access is relationship-based. They may only read and act on their own profile, assigned classes, documents, attendance, homework, results, notices, and permitted payment data. A guardian relationship must be revocable, date-effective, and auditable.

## 7. Approval and delegation model

### 7.1 Standard workflow

```text
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → EXECUTED
                    ↘ REJECTED
                    ↘ RETURNED_FOR_CHANGES → DRAFT
Any non-final state → CANCELLED or EXPIRED
```

The business command occurs only after the workflow reaches the required approval state. Approval records capture policy version, requester, approver, assigned scope, timestamp, comment, delegated authority if used, and a tamper-evident audit reference.

### 7.2 Minimum approval matrix

| Action | Requester | Required approval | Separation rule |
| --- | --- | --- | --- |
| Staff administrative-role grant/revocation | SIC/authorized admin | Principal or higher configured administrator | Requester cannot approve own change |
| Fee concession above configured threshold | Finance staff | COEF plus configured second authority | Maker and approver differ |
| Refund | Finance staff | COEF plus Principal/organization authority above threshold | Payment recorder cannot approve refund |
| Marks alteration after submission lock | Subject/Class teacher | COE or AIC as configured | Author cannot self-approve |
| Result publication | COE | Principal/authorized academic publisher | Publication is distinct from marks entry |
| Student profile sensitive-data change | Authorized staff | Branch approver where flagged | All before/after values audited |
| Guardian account recovery/relationship change | GCI/authorized staff | Relationship evidence or branch approver | Never reset using Aadhaar/UID |
| Cross-branch data transfer | Branch administrator | Sending and receiving branch authority | Both branch scopes validated |

Thresholds, approver count, expiry, and escalation are configuration, not hard-coded role names.

### 7.3 Delegation

A delegation is a time-bounded, scope-bounded grant of approval authority. It must name the delegator, delegate, permissions, scope, start/end, reason, and revocation state. Delegation cannot grant more authority than the delegator possesses and must appear in every approval audit trail.

## 8. Database domain blueprint

This is a normalized target model, not a migration instruction. Existing live tables retain their identifiers and remain compatible until their individual migration adapter is approved.

### 8.1 Organization and academic scope

| Entity | Essential fields and relationships |
| --- | --- |
| `SchoolGroup` | stable public ID, name, status; owns organizations |
| `Organization` | parent group optional, legal name, display name, code, status, locale/timezone; maps to existing `School` |
| `OrganizationRegion` | organization, name/code, status; optional regional grouping |
| `Branch` | organization, region optional, code, address, timezone, status; maps to existing `SchoolBranch` |
| `AcademicSession` | organization/branch, name, start/end, status, publication rules |
| `DepartmentScope` | organization and optional branch, name/code, status; maps to `Department` |
| `ClassSection` | branch, session, grade, section, class teacher assignment; maps to `SchoolClass` |
| `SubjectOffering` | class section, subject, assigned teaching responsibility, date-effective ownership |

### 8.2 Identity, authorization, and account safety

| Entity | Essential fields and relationships |
| --- | --- |
| `Identity` | existing user compatibility key, unique normalized email/phone where present, lifecycle state |
| `PanelEntitlement` | identity, panel code, status, reason, date-effective interval |
| `RoleDefinition` | immutable code, name, permission-template version, lifecycle |
| `PermissionDefinition` | stable code, risk class, description, deprecated state |
| `RolePermission` | role, permission, constraints/version |
| `RoleAssignment` | identity, role, scope type/id, start/end, source, approver, status |
| `ScopeGrant` | fine-grained additional permitted scope, never browser-controlled |
| `AccountInvitation` | recipient, purpose, hashed token/OTP metadata, expiry, consumed/revoked timestamps |
| `SessionRecord` | panel code, identity, issued/expiry/revocation metadata, device/session reference |

### 8.3 People, academics, finance, and communication

| Domain | Core entities |
| --- | --- |
| Workforce | `StaffProfile`, `EmploymentAssignment`, `TeachingAssignment`, `Designation`, `ReportingLine` |
| Student/guardian | `StudentProfile`, `Enrollment`, `GuardianProfile`, `StudentGuardianRelationship`, `EmergencyContact`, `ConsentRecord` |
| Academics | `AttendanceRegister`, `AttendanceEntry`, `Homework`, `LearningMaterial`, `Timetable`, `ClassTeacherAssignment` |
| Examination | `Assessment`, `MarksEntry`, `ModerationDecision`, `ResultPublication`, `ResultRevision` |
| Finance | `FeeStructure`, `FeePlan`, `Invoice`, `InvoiceLine`, `Payment`, `Allocation`, `ConcessionRequest`, `RefundRequest`, `LedgerEntry` |
| Communication | `Notice`, `RecipientTarget`, `MessageDelivery`, `Template`, `CommunicationConsent` |

### 8.4 Governance and audit

| Entity | Purpose |
| --- | --- |
| `ApprovalPolicy` | versioned action/risk/scope/threshold policy |
| `ApprovalRequest` | subject reference, requester, workflow state, policy version, requested action |
| `ApprovalStep` | assigned approver, decision, delegation reference, evidence/comment |
| `Delegation` | time- and scope-limited approval authority |
| `AuditEvent` | append-only actor/action/scope/subject/before-after summary/correlation metadata |
| `ExportJob` | requested data class, filters, requester, status, expiration, download audit |
| `DataRetentionPolicy` | retention and legal-hold configuration by data category |

### 8.5 Data rules

1. New enterprise entities should expose an opaque UUID/ULID public identifier. Existing integer primary keys stay in place and receive a compatibility mapping; they are not rewritten in bulk.
2. All tenant-owned data receives an organization foreign key. Branch/class/student-specific records also receive their applicable scope reference.
3. Monetary amounts use fixed decimal currency fields, never floating point. Payment/reconciliation changes are append-only ledger operations.
4. Assessment/marks revisions preserve a revision record; published result data is never silently overwritten.
5. Secrets, tokens, OTPs, and password reset material are stored only as salted/hashed verifier data with expiry and one-time-use semantics.
6. Sensitive personal fields are minimized, access classified, masked in standard responses, and included in audited exports only when policy permits.

## 9. Service and API boundary

The running system remains the current Next.js API route + Prisma application during Phase 1. Phase 2 may introduce an internal service layer while preserving existing API contracts. The following is a required boundary regardless of framework:

```text
Panel / mobile client
  → authenticated API endpoint
  → authorization and scope policy
  → application command/query service
  → transaction and domain event
  → audit event / approval state
  → database
```

Client components may request data but cannot make authorization decisions. Data filters such as `branchId`, `classId`, `studentId`, paging, and search terms are validated only after scope resolution.

**Proposed future decision, requiring approval:** use a modular Spring Boot backend for new enterprise modules and keep Next.js as the MUI panel/BFF facade during transition. Until approved, no Java service or database split is introduced.

## 10. Security, privacy, and operational controls

1. Panel-specific HttpOnly session cookies and panel-bound tokens remain mandatory.
2. MFA is required for organization/group administrators, finance approvers, result publishers, and any role that can grant roles or run sensitive exports.
3. Session rotation, revocation, rate limits, failed-login monitoring, and device/session audit are required before enterprise-wide rollout.
4. Production operations use environment-held secrets, rotation procedures, backups, restore testing, and a verified incident-response path.
5. Audit records must never include password material, raw OTPs, or full high-risk identifiers.
6. Destructive actions use soft delete/archive plus approval where required; permanent erasure follows retention policy and legal authorization.

## 11. Delivery sequence after approval

1. **Phase 2 — Foundation:** introduce scope registry compatibility tables, normalized permission registry, policy evaluator, and migration observability without changing user-facing operations.
2. **Phase 3 — Workforce and scoped RBAC:** migrate staff assignments and enforce scope checks on Administration and Faculty APIs.
3. **Phase 4 — Approval/audit:** deliver approval engine, delegation, audit event standard, and high-risk operation workflow.
4. **Phase 5 — Academic/student/guardian:** migrate subject/class ownership, safe invitations, guardian relationships, and scoped student APIs.
5. **Phase 6 — Finance and examination hardening:** implement append-only finance flows, marks revision/moderation, and result publication controls.
6. **Phase 7 — Reporting, mobile integration, resilience:** contractual APIs, exports, dashboards, monitoring, backup/restore drills, and penetration/security review.

Each phase uses feature flags, migration checkpoints, rollback playbooks, data reconciliation reports, and API compatibility tests. No phase begins until the preceding phase has passed its acceptance criteria.
