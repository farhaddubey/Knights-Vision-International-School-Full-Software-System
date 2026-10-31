# Phase 1: Governance and Delivery Checklist

**Status:** In review  
**Rule:** Approval of this checklist is required before implementation begins.

## A. Phase 1 deliverables

| Deliverable | Status | Evidence |
| --- | --- | --- |
| Current system foundation identified | Complete | Existing PostgreSQL/Prisma models for school, branch, class, student, department, user, RBAC, and audit were inventoried. |
| Target organization hierarchy | Complete | Documented in `phase-1-enterprise-school-group-architecture.md`. |
| Module boundaries and dependency rules | Complete | Documented in `phase-1-enterprise-school-group-architecture.md`. |
| Panel, RBAC, scope, and session policy | Complete | Documented in `phase-1-enterprise-school-group-architecture.md`. |
| Approval and delegation model | Complete | Documented in `phase-1-enterprise-school-group-architecture.md`. |
| Data-domain blueprint | Complete | Documented in `phase-1-enterprise-school-group-architecture.md`. |
| Architecture sign-off | Pending | Requires owner review and explicit approval. |

## B. Decisions requiring owner approval

These decisions are intentionally not silently implemented.

| ID | Decision | Proposed default | Why approval matters |
| --- | --- | --- | --- |
| D-01 | Group hierarchy adoption | Add optional `SchoolGroup` and `Organization` above existing school records | Determines tenancy and future expansion boundaries. |
| D-02 | Existing `School` mapping | Treat each existing School as the first Organization and preserve its key | Prevents destructive data migration but fixes future semantics. |
| D-03 | Backend transition | Keep current Next.js/Prisma running; consider a modular Spring Boot service only for future modules | Prevents an unapproved technology rewrite. |
| D-04 | Identifier policy | Preserve legacy integer IDs; add public UUID/ULID identifiers to new enterprise entities | Affects APIs, mobile applications, and integrations. |
| D-05 | Central access | Central roles receive explicit scoped permissions; no automatic bypass of branch approval policy | Prevents cross-branch overreach. |
| D-06 | Approval thresholds | Configure thresholds/steps by organization and action type | Finance, marks, and role changes need formal separation of duties. |
| D-07 | MFA baseline | Require MFA for administrators, sensitive approvers, and exporters | Raises security and operational requirements. |
| D-08 | Data retention | Define retention, legal hold, and deletion schedules for student, finance, and audit records | Determines compliance behavior. |

## C. Frozen compatibility commitments

Until a phased replacement is approved and verified:

1. Existing Sure Success Point School records remain intact; no bulk identifier rewrite.
2. Existing connected applications continue through versioned/compatible APIs.
3. Faculty, Administration, and Student/Guardian panels remain separate in admission and session handling.
4. Any active assigned non-student staff member may enter the Faculties panel, but actions remain permission- and scope-filtered.
5. Administration remains restricted to explicit administrative entitlement.
6. Student/guardian accounts never use Aadhaar/UID or other government ID values as passwords or account-recovery secrets.
7. UI visibility is not authorization; every sensitive API action remains server-enforced.

## D. Phase 2 entry gates

All of the following must be satisfied before a single production model/API/panel change begins:

- [ ] Owner approves Decisions D-01 through D-08 or records amendments.
- [ ] A source-of-truth organization/branch/department/class inventory is exported and reconciled.
- [ ] Permission catalog is approved, including exact codes and high-risk classifications.
- [ ] Current staff role assignments, class/subject responsibility, and branch scopes are validated by the school.
- [ ] Existing API/mobile app consumers are listed with compatibility expectations.
- [ ] Database backup and restore check has a recorded result.
- [ ] Migration plan identifies every proposed migration, forward step, rollback condition, and data-reconciliation query.
- [ ] Security review approves session, token, invitation, password-reset, logging, and secrets policies.
- [ ] Feature-flag and staged rollout strategy is approved.
- [ ] Test plan covers unauthorized cross-branch/class/student access, wrong-panel sessions, approval bypass, and audit evidence.

## E. Phase 2 first implementation package

Phase 2 is deliberately small and reversible:

1. Add compatibility-safe organization/scope registry tables only.
2. Add a versioned permission registry and shared server-side policy evaluator.
3. Add structured audit-event support for new operations.
4. Read existing `School`, branch, class, user, and RBAC data through adapters; do not move or delete it.
5. Ship with feature flags disabled by default, reconciliation checks, and rollback instructions.

Phase 2 does **not** include a panel redesign, bulk staff reassignment, credential reset, student migration, or finance/exam data mutation.

## F. Review record

When the owner approves, record:

| Field | Value |
| --- | --- |
| Decision/version | Phase 1 Enterprise Architecture v1 |
| Reviewer | Pending |
| Approval date/time | Pending |
| Approved amendments | Pending |
| Phase 2 scope owner | Pending |
| Rollback owner | Pending |

Approval wording: **“Phase 1 architecture approved, including recorded amendments. Begin the Phase 2 foundation package only.”**
