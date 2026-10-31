# Phase 4C: Payroll Mutation Hardening

## Dedicated policy

Payroll is no longer inferred from general fee access. Two additive permissions are now seeded:

- `payroll.read` — salary and payment history for in-scope employees.
- `payroll.manage` — create/correct a salary ledger and post payment records for in-scope employees.

`SYSTEM_ADMIN`, `SYSTEM_IN_CHARGE`, and `SCHOOL_ADMIN` inherit both through full system permissions. `COEF` and `ACCOUNTANT` receive both explicitly. `PRINCIPAL` receives payroll read only. Teachers, class teachers, COE, AIC, and GCI do not gain payroll mutation access.

## Protected mutations

All legacy API spellings delegate to one server-side handler for:

1. salary creation;
2. salary correction;
3. salary deletion;
4. salary payment posting.

The handler resolves the employee from the salary record, validates its real school/branch scope, derives the actor from the signed-in session, and ignores browser-supplied payer and audit IDs.

## Financial invariants

- A salary record may exist once per employee/month through the hardened create path.
- Salary-paid and remaining-balance values cannot be set from the browser.
- Salary updates recompute the remaining balance from net salary minus the recorded paid amount.
- Salary records with payments cannot be deleted.
- Payment posting uses an atomic conditional balance reduction. A stale or concurrent request that would exceed the latest remaining amount receives `409` and creates no payment log.
- Attendance links are accepted only when every linked attendance log belongs to the salary employee.

## Current limitation

The legacy database schema has no persistent idempotency key or unique payment reference. The atomic balance guard prevents overspending, but it cannot identify a network retry as the same payment. Add a dedicated idempotency-key column/table before enabling automatic retries from payment clients.
