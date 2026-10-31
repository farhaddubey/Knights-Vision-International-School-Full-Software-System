# Phase 4H: Finance and Fee-Ledger Hardening

## Delivered

The legacy monthly-fee APIs accepted school, branch, class, admission, amount,
receiver, and payment-date values from the browser. That allowed a caller to
attempt a cross-scope payment or alter a fee amount before it reached the
ledger. The legacy fee-scheme update route also modified the wrong Prisma
model, and fee-override routes referenced a model/table that did not exist.

This phase repairs those compatibility defects and makes the existing school
fee ledger authoritative.

- `FeeOverride` is now an additive, one-per-admission model with a database
  foreign key. Its migration was applied without changing historical fee rows.
- Monthly-fee creation derives school, branch, class, admission, due date, and
  due amount from the canonical student, class fee scheme, and (when present)
  that admission's override. Browser copies of those values are ignored.
- Admission-fee transactions likewise use the canonical fee scheme/override,
  not a client supplied amount.
- Fee-scheme and fee-override reads are filtered through the staff member's
  actual school/branch/class assignments. Writes resolve the owning class or
  admission before mutating anything.
- The corrected `/api/fee-schemes/[id]` handler now updates fee schemes. The
  previous handler incorrectly attempted to update a fee override.

## Payment safety

- Fee reads require `fee.read`; fee schemes, overrides, monthly fees, and
  receipt mutations require `fee.manage`.
- A monthly payment validates method, reference length, positive amount, and
  outstanding balance. The receiving staff user is always derived from the
  authenticated session.
- Non-cash methods require a transaction/reference ID. The database enforces
  one reference per monthly-fee ledger row while allowing one genuine gateway
  settlement to cover several separate months.
- Every payment mutation locks its monthly-fee row before calculating the new
  balance. Concurrent cash requests therefore serialize: the second request
  sees the settled or reduced balance instead of creating a duplicate payment.
- When a non-cash request is retried with the same reference, the existing
  payment is returned as an idempotent result instead of being charged again.
- Fee overrides cannot be deleted once that admission has monthly-fee or
  admission-fee financial activity. They may still be updated for future
  ledger rows, with a structured audit event.

## Compatibility and panel behavior

- `/api-schools-panel/fee-schemes` and `/api-schools-panel/fee-overrides`
  delegate to the protected canonical routes, removing drift between old and
  new panel URLs.
- Class-name, class-ID, and fee-scheme lookup compatibility endpoints delegate
  to one scoped implementation.
- Existing dialogs preserve their visual design. Their payment submission now
  uses the server-returned ledger total, which keeps an existing override from
  being rejected as an overpayment.
- An audit write is attempted for financial configuration and payment changes.
  If that secondary write is unavailable after a ledger commit, the completed
  financial operation still returns successfully and the server records the
  audit outage for follow-up; it is never retried as an apparent failed
  payment.

## Verification completed

- Prisma schema validation and migration deployment succeeded against
  `suresuccesspointschool-db`.
- The regenerated Prisma client includes `feeOverride`.
- Anonymous fee-scheme, override, and monthly-fee status requests return
  `401`.
- The root administrator receives `200` from canonical and compatibility fee
  reads. A normal `TEACHER` receives `403` from all three protected finance
  reads.
- Malformed fee-scheme, override, payment, and missing-class lookup requests
  return `400` without writing a record.
- Administration, Faculty, and Student panel roots all return `200` after the
  change.

## Remaining finance scope

This completes the school fee-ledger hardening slice. It does not introduce a
bank-gateway reconciliation, refund/reversal ledger, accounting export, or
approval workflow for waivers/adjustments. Those require their own explicit
business rules and should be added as new immutable financial records rather
than by editing existing payments.
