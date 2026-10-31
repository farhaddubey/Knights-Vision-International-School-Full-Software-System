# Phase 4F: Guardian Communication Hardening

**Status:** Deployed in the application layer.  
**Scope:** Staff guardian communication logs, guardian call logs, parent-teacher meeting notes, and their class-student selection routes.

## Access policy

- Every staff read requires `guardian_communication.read`.
- Every staff write requires `guardian_communication.manage`.
- GCI, AIC, class-teacher, and system roles receive the appropriate seeded permissions. The legacy `GUARDIAN_COMMUNICATION_IN_CHARGE` role now maps to those same permissions for compatibility.
- Class teachers with the guardian-communication role are limited to their assigned class. GCI, AIC, principals, and system-level roles may work in their assigned school/branch scope.
- The Student Panel's existing personal communication and parent-teacher-note reads remain protected by its dedicated student session; no student receives staff list or write access.

## Server-owned scope and authorship

1. The route class name is resolved to a canonical `SchoolClass`; school, branch, class, and student membership are then verified from PostgreSQL before any record is read or written.
2. Browser-supplied `schoolId`, `branchId`, `classId`, `recordedById`, `calledById`, and `takenById` values are never trusted. Persisted scope comes from the resolved class and the recorder identity comes from the authenticated session.
3. Pagination and student-name search operate only inside the already authorized canonical class.
4. Communication types, methods, dates, text sizes, and structured JSON fields are validated before records are created.

## Parent-teacher compatibility repair

The existing MUI dialog submits `summary` and `detailedNotes`, while the current Prisma model stores `summary_realization` and `guardianInstruction`. The new route maps those values safely and returns the legacy UI labels, so the screen works without a visual or client-contract redesign.

The active dialogs also called a missing dynamic URL for communication-student selection. `/api/GuardianCommunicationLogs/[className]/students` and its `/api-schools-panel` alias now exist and use the same class-scoped authorization.

## Compatibility routes

- `/api/GuardianCommunicationLogs/*`, `/api/GuardianCallLogs/*`, and `/api/ParentTeacherMeetingNotes/*` are canonical protected handlers.
- Their `/api-schools-panel/*` counterparts now delegate to the canonical handlers.
- Response shapes such as `{ logs, totalPages }`, `{ notes, totalPages }`, and `{ students }` remain compatible with the existing panels.

## Deliberately separate legacy System Units APIs

`/api/complaints` and `/api/requests` are inherited generic CRM/legal-service routes used by System Units. Their current Prisma calls no longer match the database schema and both return `500`; their record models have no school, branch, or class ownership. They are not merged into learner guardian communications. They are queued for the administrative approvals/operations hardening phase, where their ownership and payment/notification side effects can be decided safely.

## Verification

- system administration returned `200` for all three staff communication collections, the repaired student selector, and the legacy school-panel alias;
- a normal teacher received `403` for all staff guardian communication reads and an attempted create;
- anonymous staff reads and writes returned `401`;
- a malformed authenticated create returned `400` without a write;
- all three panel roots remained reachable, and focused TypeScript checks produced no diagnostics for this phase.
