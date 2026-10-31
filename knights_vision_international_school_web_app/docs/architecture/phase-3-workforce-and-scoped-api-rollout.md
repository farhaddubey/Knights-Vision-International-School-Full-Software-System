# Phase 3: Workforce and Scoped API Rollout

**Status:** Phase 3A, 3B, and the student-session portion of 3C deployed; remaining legacy-domain migration continues.  
**Scope:** Compatibility-safe workforce ledger plus resource-level protection of priority Administration, Faculty, Student Panel, homework, examination, and result APIs.

## Phase 3A delivered

1. `WorkforceAssignment` is an additive ledger for staff responsibility. It mirrors active records from scoped RBAC roles, branch roles, class-teacher assignments, class-subject teacher assignments, and legacy staff roles.
2. The synchronization process is idempotent. It upserts current source records and deactivates only stale automatically managed ledger records. It never deletes or rewrites a legacy staff, class, subject, or RBAC record.
3. RBAC management endpoints require an Administration-bound session. Scoped administrators see only records in their granted school, branch, or class scope.
4. A non-system administrator cannot create a role definition or grant/revoke a role containing access-control or Critical-risk permissions.
5. Priority faculty attendance, class-subject, class-student, and homework-creation APIs authorize from database-backed permissions and canonical resource scope.

## Phase 3B delivered

1. A shared `classSubjectAccess` layer resolves class subjects, tests, board exams, and classes from PostgreSQL before authorizing access. Browser-supplied school, branch, class, subject, and student ownership fields are not trusted.
2. The protected academic writes require the relevant RBAC permission and scope:
   - homework batch creation requires `homework.manage`;
   - test creation, marks, semester results, and board-exam results require `exam.manage`;
   - result views, internal-mark calculation, and scoped class data require `exam.read` or `student.read`.
3. Subject and class teachers remain limited to their assigned subject/class. Examination supervisors (COEF, Exam Controller, AIC, Academic Coordinator, Principal, System Administrator) can manage examination work inside their assigned scope.
4. Batch homework and test creation now use one compatibility-safe implementation across `/api`, `/api-schools-panel`, and class-teacher URLs.
5. Semester result writes derive class, branch, school, subject, total marks, and student membership from canonical records. Batch initialization does not overwrite marks already recorded by an authorized user.
6. Semester calculation windows follow each class academic year. Existing client labels such as `First` and `Second` are normalized to the stored semester codes.
7. Examination, result, homework, and test mutations emit secret-safe `EnterpriseAuditEvent` records.

## Phase 3C delivered: Student Panel session and ownership boundary

1. Student sessions now require both `panel: "STUDENTS"` and `role: "STUDENT"`. The current Student record supplies the authoritative student, school, branch, and class scope; browser token claims are never used for those scopes.
2. The student validation, profile, password change, attendance, fees, results, homework, assignments, tests, books, semester schedules, holidays, communication logs, meeting notes, leave requests, food instructions, and improvement-suggestion routes use the shared student-session boundary.
3. Student homework, assignment, test, and book reads require the requested class subject to belong to the student's current class, branch, and school. Peer homework-status reads are rejected, and Student Panel homework-status writes are rejected.
4. The Student Panel no longer calls teacher assignment/test endpoints or exposes teacher-only controls for creating assignments, creating tests, managing homework, peer submissions, peer marks, or class-wide reports. It shows only the student's own assignment submission and marks.
5. Student profile responses explicitly omit password hashes and account-activation hashes. The login screen no longer describes UID/Aadhaar as a password; first use requires the school's activation code and a user-chosen password.
6. `HolidayCalendar` is currently a global table in the database schema. The Student Panel returns its monthly public calendar data with a compatibility `appliesTo: "ALL"` value until a configurable school/class holiday scope is added.

### Parent/guardian access policy

Parents and guardians use the student's activated Student Panel account by school policy. No separate Guardian login, Guardian-to-Student relationship, or Guardian Panel authorization is required in this rollout. The Student Panel remains read-limited and owns only the student's records; the account holder can change the password after first activation.

## Live rollout result

The initial workforce reconciliation created 158 active workforce assignments:

| Assignment kind | Active records |
| --- | ---: |
| Administrative | 20 |
| Teacher | 8 |
| Class teacher | 2 |
| Subject teacher | 128 |

## Verification

- Prisma schema is valid and PostgreSQL reports all 30 migrations applied.
- Workforce synchronization check reports 158 expected and active assignments, with zero missing/inactive or stale automatic entries.
- Live authorization checks confirm:
  - unauthenticated academic batch writes return `401`;
  - a normal teacher without `exam.manage` receives `403` for batch examination creation;
  - an assigned class teacher receives `200` for their semester results and class students;
  - the same teacher receives `403` for an out-of-scope class subject.
- Student-session checks confirm:
  - a valid Student Panel session returns `200` from session validation while an otherwise valid Faculty token returns `403`;
  - no student session returns `401` for personal data;
  - an active student's profile, attendance, class subjects, assignments, tests, homework report, books, and schedules return only the current student/class scope;
  - a request for another student's homework status returns `403`;
  - no checked student profile response exposed `loginPassword` or `loginActivationCodeHash`.
- Focused TypeScript checks report no diagnostics in the Phase 3B files. The complete project type check still has older Next 15 `params` signature errors in unrelated legacy routes.

## Controls retained

- Administration and Faculties sessions remain distinct.
- Existing panel design and covered API response shapes are preserved.
- RBAC deactivation remains historical (`isActive = false` plus `endsAt`) rather than deleting assignment records.
- Student-facing routes use their dedicated Student Panel guard, never staff-only RBAC guards. Parent/guardian access follows the school's shared student-account policy.

## Remaining Phase 3 work

The repository still contains older domain APIs that predate the shared policy layer. Student/class attendance history and leave-request approvals are covered by [Phase 4A](./phase-4-attendance-hardening.md); employee attendance and salary-history reads are covered by [Phase 4B](./phase-4-employee-attendance-hardening.md); payroll mutations are covered by [Phase 4C](./phase-4-payroll-mutation-hardening.md); admissions workflow routes are covered by [Phase 4D](./phase-4-admissions-hardening.md); fleet, depots, vehicle documents, and maintenance are covered by [Phase 4E](./phase-4-transport-hardening.md); and staff guardian logs, calls, and parent-teacher notes are covered by [Phase 4F](./phase-4-guardian-communication-hardening.md). Continue endpoint-by-endpoint, preserving compatibility, with administrative approvals and the separate legacy System Units operations routes.
