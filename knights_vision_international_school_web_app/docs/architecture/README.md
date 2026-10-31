# Sure Success Point School Enterprise Architecture

This folder contains the architecture and governance material for evolving the current school system into a safe multi-school-group platform.

## Current phase

**Phase 4H - finance and fee-ledger hardening.**

Phases 1 and 2 established the architecture, scope foundation, policy metadata, and audit ledger. Phase 3A/3B established workforce, academic, and student-panel boundaries. Phase 4A-4H now protects attendance, payroll, admissions, transport, guardian communications, operational approvals, System Units compatibility, and the school fee ledger. Remaining work is long-tail legacy route cleanup, payment reconciliation/refund workflows, and other historical finance surfaces.

## Documents

1. [Phase 1 enterprise architecture](phase-1-enterprise-school-group-architecture.md) - target hierarchy, module boundaries, security model, approvals, and data-domain blueprint.
2. [Phase 1 governance and delivery checklist](phase-1-governance-and-delivery-checklist.md) - decisions requiring approval, migration gates, and acceptance criteria.
3. [Phase 3 workforce and scoped API rollout](phase-3-workforce-and-scoped-api-rollout.md) - deployed workforce ledger, academic API enforcement, verification, and remaining migration backlog.
4. [Phase 4 admissions hardening](phase-4-admissions-hardening.md) - scoped applications, admissions, fee-aware finalization, readmission, and compatibility controls.
5. [Phase 4 transport hardening](phase-4-transport-hardening.md) - permission-protected fleet, depots, vehicle documents, maintenance, and legacy panel aliases.
6. [Phase 4 guardian communication hardening](phase-4-guardian-communication-hardening.md) - scoped staff guardian logs, calls, parent-teacher notes, and Student Panel compatibility.
7. [Phase 4 operations and approval hardening](phase-4-operations-and-approvals-hardening.md) - scoped operational requests, approval authority, and student-linked school concerns.
8. [Phase 4 finance and fee-ledger hardening](phase-4-finance-hardening.md) - scoped fee schemes and overrides, server-derived fee amounts, payment locks, and compatibility aliases.

## Existing foundation

The current platform is a Next.js/MUI application backed by PostgreSQL through Prisma. It uses `School`, `SchoolBranch`, `SchoolClass`, `Student`, `Department`, `User`, role, permission, workforce, and access-audit models. Future phases must extend this foundation incrementally and preserve existing IDs, routes, integrations, and records.
