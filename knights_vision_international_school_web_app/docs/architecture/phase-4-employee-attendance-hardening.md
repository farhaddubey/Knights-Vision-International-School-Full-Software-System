# Phase 4B: Employee Attendance and Salary-History Hardening

## Boundary implemented

The legacy employee attendance APIs used browser-provided employee IDs and old JWT claims.  Phase 4B now resolves the current account, the target employee, and the employee's school/branch scope on the server.

| Operation | Required access |
| --- | --- |
| Read own attendance or salary history | Any authenticated staff-panel account (`panel.access`) for its own user ID only |
| Read another employee's attendance | `staff.read` + `attendance.read`, within that employee's school/branch scope |
| Create, correct, or delete another employee's attendance | `staff.manage` + `attendance.manage`, within scope |
| Read another employee's salary or payment history | `payroll.read`, within that employee's school/branch scope |
| List a month's salary records | `payroll.read`, filtered to the caller's scope |

Classroom attendance permissions do not grant employee-ledger or payroll-history access.  Employee IDs, school IDs, branch IDs, creator IDs, and updater IDs are all resolved or recorded on the server.

## Compatibility

Both legacy URL spellings remain available:

- `/api/...` and `/api-schools-panel/...`
- `employee-attendance-logs`
- `employee_salaries` and `employee-salaries`

The existing faculty self-service screens continue to send their current user ID, but the server now verifies that it belongs to the signed-in session before returning data.  Existing administrative screens retain their response shapes and pagination.

## Explicitly deferred to Phase 4C

This phase deliberately does not redesign salary calculations. The existing attendance-correction aggregation is preserved and is now authorized/audited. Payroll creation, updates, deletion, and payment posting are covered by [Phase 4C](./phase-4-payroll-mutation-hardening.md).

The legacy mid-day verification route is protected but returns `409` because the active Prisma data model no longer contains the verification fields that route attempted to update.  Re-enable it only through a migration that adds a defined verification state and audit data.
