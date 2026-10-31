# Phase 4D: Admissions Workflow Hardening

**Status:** The active Administration and Faculties admission routes are protected by the shared panel session, database-backed permissions, and canonical school/branch/class scope checks.

## Boundary implemented

1. Admission applications, admission tests, evaluation, results, seating lists, qualified/non-qualified lists, admissions, receipts, admitted-student lists, admission fee history, and readmission eligibility all require a signed staff session.
2. The legacy `/api/...` URLs remain supported because both panels actively use them. Their `/api-schools-panel/...` equivalents now delegate to the same guarded handlers, so there is no weaker compatibility path.
3. Every write resolves the real `SchoolClass`, `Student`, `AdmissionTestApplication`, `AdmissionTest`, `Admission`, and `FeeScheme` records before permission and scope checks. Client-provided school, branch, class, student, fee, or audit fields cannot establish authority.
4. Application and admission mutations are allow-listed. IDs in a dynamic path are authoritative; an omitted or conflicting browser body ID cannot select a different record.
5. Student creation in combined final admission uses the stored application as the source of personal data. It never accepts a browser-controlled password or activation secret.

## Role and financial controls

- Admission records, applications, test configuration, evaluation, and seating require `admission.read` or `admission.manage` at the resolved scope.
- Finalizing a paid/confirmed admission, recording an admission fee, or processing readmission additionally requires `fee.manage`.
- Receipts and admission-fee history require both `admission.read` and `fee.read`.
- Readmission also requires `student.manage`; the source student and target class must both be in scope.
- Fee amounts are derived from the server-side `FeeScheme`. The browser cannot choose the amount, receiving user, school/branch/class, or payment timestamp.
- Admissions and tests with linked financial/child records cannot be deleted through the hardened endpoints.

## Compatibility repairs

- The dynamic application route now supports the panel's existing `PATCH` call as well as `PUT`; it resolves the path ID correctly.
- Legacy application/test list count queries now use the same scoped predicates as their rows.
- The old readmission endpoint referenced undefined variables and attempted to persist a non-existent `Admission.academicYear` field. The repaired flow derives fees from the selected server-side scheme, creates a single transaction, and updates the student only inside one transaction.
- Salary navigation now maps to `payroll.read`/`payroll.manage`, not fee permissions, matching Phase 4C.

## Verification

- Unauthenticated admission reads return `401`.
- A signed teacher session is rejected with `403` for every verified admission read and write surface.
- A system administrator session receives `200` from application, admission, test, result, seating, admitted-student, receipt, and admission-fee history reads.
- Both active `/api` and `/api-schools-panel` compatibility roots return `200` for the authorized session.
- Empty/malformed create input returns `400` after authorization and creates no record.

## Current limitations and next work

1. The legacy schema does not have a durable idempotency key for an independently posted admission-fee transaction. The handler blocks a known existing transaction, but a database unique key is required before clients may automatically retry payment submission.
2. General fee schemes, fee overrides, monthly-fee payment mutations, and external payment-gateway callbacks are separate finance work. They are not represented as fully append-only ledgers yet.
3. Transport, communications, and administrative approval workflows remain the next legacy-domain hardening targets after this admissions slice.
