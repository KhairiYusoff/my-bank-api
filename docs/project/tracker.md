# Tracker

**Last Updated:** May 30, 2026
**Current Phase:** Phase 3 complete — Phase 5 is next code phase

See [roadmap.md](roadmap.md) for full project history and phase descriptions.

---

## Now — Phase 5: Transaction Detail Enrichment

Read the story before writing any code: [US-5001 — Transaction Receipt](../user-stories/phase-5/US-5001-transaction-receipt.md)

Sub-tasks in order: **BE1 → BE2 → BE3 → BE4 → BE5 → BE6 → FE1 → FE2**

> `3B2` (wire transaction detail in customer app) is part of US-5001-FE1 — do not implement separately.

---

## Completed

### Documentation Rewrite (May 29, 2026) ✅

| #   | Task                                                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------- |
| D1  | Created `docs/product/business-rules.md` — account types, limits, fees, lifecycle, interest, reference format |
| D2  | Rewrote `docs/product/problem.md` — new vision, correct scope, AI on-hold                                     |
| D3  | Rewrote `docs/product/user-stories.md` — full set from scratch (auth through AI)                              |
| D4  | ~~`docs/product/requirements.md`~~ — **deleted** (replaced by `business-rules.md` + user-stories index)       |
| D5  | Updated `docs/project/roadmap.md` — Phase 4 AI marked ON-HOLD, Phases 6–12 added                              |
| D6  | Updated `docs/project/tracker.md` — current state                                                             |

### Phase 3A — Admin Portal Gap Closure (May 29, 2026) ✅

| #   | Task                                                                                   |
| --- | -------------------------------------------------------------------------------------- |
| 3A1 | P0 fix: `GET /transactions/account/:accountNumber` returning empty — wrong query field |
| 3A2 | Wired `PUT /admin/staff/:staffId` + `DELETE /admin/staff/:staffId`                     |
| 3A3 | Wired `PUT /admin/customer/:customerId` + `DELETE /admin/customer/:customerId`         |
| 3A4 | Wired `GET /transactions/:transactionId` — detail dialog in admin portal               |
| 3A5 | Added `StyledTableCell` + `StyledTableRow` missing exports to `TableStyles.tsx`        |

### Phase 3B (most items) — Customer App (May 29, 2026) ✅

| #   | Task                                                                              |
| --- | --------------------------------------------------------------------------------- |
| 3B1 | `GET /accounts/` — already consumed in Dashboard + hooks                          |
| 3B3 | `GET /expenses/categories` + `/payment-methods` — consumed in `useExpenseActions` |
| 3B4 | `GET /expenses/dashboard/stats` — consumed in `useAnalytics`                      |

### Phase 2 — Architecture Completion (May 25, 2026) ✅

| #   | Task                                                                                      |
| --- | ----------------------------------------------------------------------------------------- |
| 2D  | Replaced all 6 local `handleError` copies with shared `error()` utility                   |
| 2A  | Created `auth.service.js` — extracted login, logout, refreshToken                         |
| 2B  | Expanded `onboarding.service.js` — extracted all fat controller logic                     |
| 2C  | Expanded `audit.service.js` — extracted 3 read functions with shared `_queryLogs` builder |

### Phase 1 — Codebase Hardening (May 13–19, 2026) ✅

All 1A–1E tasks done. See roadmap.md for detail.

### Phase 0 — Foundation & Deployment (May 8–10, 2026) ✅

All services deployed. P0 bugs fixed. See roadmap.md for detail.

---

## Phase 5 Backlog — Transaction Detail Enrichment (Next Code Phase)

Full story + AC: [US-5001-transaction-receipt.md](../user-stories/phase-5/US-5001-transaction-receipt.md)

| Sub-task    | Task                                                                                                                                                                | Priority |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| US-5001-BE1 | Add 5 new fields to `Transaction` schema (`reference`, `counterpartAccount`, `counterpartName`, `balanceAfter`, `fee`) + Counter collection for reference sequences | 🔴 MVP   |
| US-5001-BE2 | Populate all fields in `transferFunds` (both from/to records)                                                                                                       | 🔴 MVP   |
| US-5001-BE3 | Populate `reference`, `balanceAfter`, `fee: 0` in deposit, withdraw, airdrop                                                                                        | 🔴 MVP   |
| US-5001-BE4 | Return new fields in `getAccountTransactions` + `getTransactionById` responses                                                                                      | 🔴 MVP   |
| US-5001-BE5 | Apply masking logic in customer-facing response (counterpart name + account number)                                                                                 | 🔴 MVP   |
| US-5001-BE6 | Write automated tests for reference uniqueness, masking, balanceAfter correctness                                                                                   | 🔴 MVP   |
| US-5001-FE1 | Receipt-style transaction detail dialog in customer app                                                                                                             | 🔴 MVP   |
| US-5001-FE2 | Unmasked transaction detail view in admin portal                                                                                                                    | 🔴 MVP   |

---

## Phase 6 Backlog — Account Type Differentiation

| #   | Task                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 6A1 | Add `overdraftLimit`, `monthlyWithdrawalCount`, `lastWithdrawalMonthReset` to Account model |
| 6A2 | Enforce daily transfer limits + single transfer cap per account type                        |
| 6A3 | Enforce Savings monthly withdrawal counter (max 4/month)                                    |
| 6A4 | Enforce overdraft for Current/Business                                                      |
| 6A5 | Block all transfers on FD accounts                                                          |
| 6A6 | Monthly maintenance fee cron                                                                |
| 6A7 | Savings interest cron                                                                       |

---

## Phase 7 Backlog — Fixed Deposit

| #   | Task                                                                                          |
| --- | --------------------------------------------------------------------------------------------- |
| 7A1 | FD model: principal, lockPeriod, maturityDate, interestRate, linkedAccount, autoRenew, status |
| 7A2 | FD creation endpoint                                                                          |
| 7A3 | Maturity cron + interest credit                                                               |
| 7A4 | Early withdrawal endpoint                                                                     |
| 7A5 | Auto-renewal logic                                                                            |
| 7A6 | FD detail page in customer portal                                                             |
| 7A7 | FD maturity notifications (T-7 days + on day)                                                 |

---

## Phase 8 Backlog — Dormancy & Lifecycle

| #   | Task                                                |
| --- | --------------------------------------------------- |
| 8A1 | Dormancy cron (daily, 12-month no-activity trigger) |
| 8A2 | Block transactions on dormant accounts              |
| 8A3 | Dormancy fee cron (RM10/year anniversary)           |
| 8A4 | Reactivation endpoint                               |
| 8A5 | Suspension endpoint                                 |
| 8A6 | Account closure flow                                |

---

## Phase 9 Backlog — Statements

| #   | Task                                                           |
| --- | -------------------------------------------------------------- |
| 9A1 | `GET /accounts/:accountNumber/statement?month=&year=` endpoint |
| 9A2 | Statement UI in customer portal                                |
| 9B1 | PDF generation endpoint (later)                                |

---

## Phase 10 Backlog — Beneficiaries

| #    | Task                                  |
| ---- | ------------------------------------- |
| 10A1 | Add `beneficiaries[]` to User model   |
| 10A2 | CRUD endpoints for beneficiaries      |
| 10A3 | Beneficiary selector in transfer form |

---

## Performance Backlog (non-blocking)

| #   | Item                                                                                    | Impact |
| --- | --------------------------------------------------------------------------------------- | ------ |
| P1  | `authorizeRoles` redundant `User.findById` — `req.user` already set by `authMiddleware` | Medium |
| P2  | Route auto-loader in `server.js`                                                        | Low    |
