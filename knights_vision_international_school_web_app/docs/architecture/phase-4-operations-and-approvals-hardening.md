# Phase 4G: Operations and Approval Hardening

## Delivered

The inherited `/api/requests` routes referenced a legal-services Prisma model
which is not present in the school database. The inherited `/api/complaints`
routes used a global Guardian/Customer shape with no school, branch, class, or
student ownership. Both route families therefore failed with `500` and could
not be safely scoped.

They now have school-native replacements while retaining their URLs:

- `OperationalRequest` is an additive, branch-scoped request and approval
  ledger. The server derives the requester, school, and branch from the
  authenticated user and selected canonical branch.
- `SchoolConcern` is an additive, student-linked concern record. It derives
  school, branch, and class from the selected real student and never trusts
  these identifiers from the browser.
- Existing `Complaint`, Guardian, and unrelated legal-service records were not
  deleted or transformed.

## Authorization policy

- Operational request reads require `operations.read`.
- Operational request creation and non-decision changes require
  `operations.manage`.
- Only `approval.manage` may set `APPROVED` or `REJECTED`.
- School concern reads/writes use guardian-communication permissions and are
  filtered by school/branch/class assignment.
- Requests and concerns are retained for audit; their `DELETE` routes return
  `405`. A request is cancelled through its status and a concern is resolved or
  closed.

The seeded COE role receives `approval.read` and `approval.manage`; system and
school administrators retain their existing full authority.

## Compatibility and panel integration

- `/api-schools-panel/requests` and `/api-schools-panel/complaints` delegate
  to their protected canonical handlers.
- The existing System Units administration view now uses school operational
  fields rather than external legal-service/customer fields.
- The Faculty System Units request and concern views delegate to the
  Administration implementation, removing this duplication without changing
  the panel visual style.

## Verification

- The migration is applied to `suresuccesspointschool-db`.
- RBAC seed/check reports all 44 permissions and 18 roles present.
- Anonymous canonical routes return `401`.
- A system administrator receives `200` from canonical and compatibility
  routes; malformed writes return `400` without writes.
- A normal teacher receives `403` for operational requests and school
  concerns.

## Next finance target

The next hardening slice is monthly-fee mutation handling: derive all student
scope on the server, validate payment amounts against the ledger, record the
receiving staff member, and add database-backed idempotency for payment
references before migrating the legacy fee-scheme and override routes.
