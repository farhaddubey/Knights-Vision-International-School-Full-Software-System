# Phase 4A: Attendance and Leave-Request Hardening

**Status:** Implemented and live-verified.  
**Scope:** Legacy student-attendance and leave-request URLs used by the Administration and Faculties panels.

## Delivered

1. The legacy `/api/attendance`, `/api-schools-panel/attendance`, and `/api-schools-panel/class_teachers_panel/attendance` route families now share `src/lib/attendance/scopedAttendance.ts`.
2. Attendance reads require `attendance.read`; the class is resolved from PostgreSQL and checked against the caller's database-backed school, branch, and class scope.
3. Daily attendance writes require `attendance.manage` and are limited to the assigned class teacher or an in-scope academic administrator with `class.manage`.
4. Attendance records always use the canonical student/class/branch/school from the database. Route names, body IDs, fixed branch IDs, and browser-supplied approver IDs are never trusted for authorization.
5. Student attendance history and class monthly reports retain their existing response shapes while only returning the authorized class/student data.
6. Class leave queues, leave history, and approval routes use the same scope controls. The server derives `approvedById` and the approval time from the authenticated staff account.
7. All duplicate route implementations in the covered groups no longer use raw JWT verification, a per-request Prisma client, or fixed `schoolId`/`branchId` values.

## Verification

- An unauthenticated legacy attendance-register request returns `401`.
- A global System In Charge session returns `200` for the class register, student daily record, history, and monthly report.
- A class teacher receives `200` for the assigned class and `403` for a different class.
- A class teacher receives `200` for the assigned leave queue; a non-existent leave-request update returns `404` and makes no write.
- Focused TypeScript checks report no diagnostics in the Phase 4A source files.
- Scoped diff check passes.

## Known data-model constraint

`LeaveRequest.approved` is a Boolean. It cannot distinguish “pending” from “rejected” after a false value is saved. The hardened API preserves the existing compatibility behavior (`false` is treated as unapproved). A later approved schema migration should introduce an explicit leave-request status and optional rejection reason before a workflow UI claims separate pending/rejected states.

## Still outside Phase 4A

Employee attendance and salary logs, admissions, finance/fees, transport, communications, and broader administrative approval workflows remain separate domain hardening work.
