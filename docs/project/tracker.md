# Tracker

**Last Updated:** May 30, 2026
**Current Phase:** Phase 3 complete — Phase 5 is next code phase

See [roadmap.md](roadmap.md) for full project history and phase descriptions.

---

## Now — Phase 5: Transaction Enrichment

Four stories, implement in dependency order:

1. [US-5001](../user-stories/phase-5/US-5001.md) — `my-bank-api` — Transaction model + API (do this first)
2. [US-5002](../user-stories/phase-5/US-5002.md) — `my-bank-customer` — Receipt drawer (depends on US-5001)
3. [US-5003](../user-stories/phase-5/US-5003.md) — `my-bank-admin-portal` — Unmasked detail panel (depends on US-5001)
4. [US-5004](../user-stories/phase-5/US-5004.md) — both portals — Currency formatting `RM X,XXX.XX`

> Read the full AC in each story file before writing any code.

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

## Phase 5 Backlog — Transaction Enrichment (Next Code Phase)

| Story                                         | Repo                                   | Summary                                                                                                            | Status |
| --------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------ |
| [US-5001](../user-stories/phase-5/US-5001.md) | `my-bank-api`                          | 12 new Transaction fields, Counter model, `maskName` utility, role-based API responses, `Account.currency` bug fix | ⬜     |
| [US-5002](../user-stories/phase-5/US-5002.md) | `my-bank-customer`                     | Tappable transaction rows + receipt drawer, null handling for pre-Phase-5 records                                  | ⬜     |
| [US-5003](../user-stories/phase-5/US-5003.md) | `my-bank-admin-portal`                 | Unmasked detail panel with deviceInfo, processingTime, duration                                                    | ⬜     |
| [US-5004](../user-stories/phase-5/US-5004.md) | `my-bank-customer`, `my-bank-admin-portal` | Currency display standardised — all amounts show `RM X,XXX.XX`                                                 | ⬜     |

---

## Phase 6 Backlog — Admin Detail Pages

| Story   | Repo                                  | Summary                                                                                          | Status |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| [US-6001](../user-stories/phase-6/US-6001.md) | `my-bank-api`, `my-bank-admin-portal` | Admin views full customer profile — `GET /admin/customer/:id` + detail page  | 📝     |
| [US-6002](../user-stories/phase-6/US-6002.md) | `my-bank-api`, `my-bank-admin-portal` | Admin views staff profile — `GET /admin/staff/:id` + detail page             | 📝     |

---

## Phase 7 Backlog — Account Type Differentiation

| #   | Task                                                                                        |
| --- | ------------------------------------------------------------------------------------------- |
| 7A1 | Add `overdraftLimit`, `monthlyWithdrawalCount`, `lastWithdrawalMonthReset` to Account model |
| 7A2 | Enforce daily transfer limits + single transfer cap per account type                        |
| 7A3 | Enforce Savings monthly withdrawal counter (max 4/month)                                    |
| 7A4 | Enforce overdraft for Current/Business                                                      |
| 7A5 | Block all transfers on FD accounts                                                          |
| 7A6 | Monthly maintenance fee cron                                                                |
| 7A7 | Savings interest cron                                                                       |

---

## Phase 8 Backlog — Role Expansion (4 Roles)

| Story  | Repo                                  | Summary                                                                                          | Status |
| ------ | ------------------------------------- | ------------------------------------------------------------------------------------------------ | ------ |
| US-8001 | `my-bank-api`                         | Add `auditor` role — expand User model enum, update all `authorizeRoles()` calls per RBAC matrix | ⬜     |
| US-8002 | `my-bank-api`, `my-bank-admin-portal` | Staff first-login flow — forced password change + basic profile setup                            | ⬜     |
| US-8003 | `my-bank-admin-portal`                | Role-based navigation — restrict sidebar menus and routes based on logged-in staff role          | ⬜     |

> Read `docs/engineering/security/authorization.md` before writing any code for Phase 8.

---

## Phase 9 Backlog — Fixed Deposit

| #   | Task                                                                                          |
| --- | --------------------------------------------------------------------------------------------- |
| 9A1 | FD model: principal, lockPeriod, maturityDate, interestRate, linkedAccount, autoRenew, status |
| 9A2 | FD creation endpoint                                                                          |
| 9A3 | Maturity cron + interest credit                                                               |
| 9A4 | Early withdrawal endpoint                                                                     |
| 9A5 | Auto-renewal logic                                                                            |
| 9A6 | FD detail page in customer portal                                                             |
| 9A7 | FD maturity notifications (T-7 days + on day)                                                 |

---

## Phase 10 Backlog — Dormancy & Lifecycle

| #    | Task                                                |
| ---- | --------------------------------------------------- |
| 10A1 | Dormancy cron (daily, 12-month no-activity trigger) |
| 10A2 | Block transactions on dormant accounts              |
| 10A3 | Dormancy fee cron (RM10/year anniversary)           |
| 10A4 | Reactivation endpoint                               |
| 10A5 | Suspension endpoint                                 |
| 10A6 | Account closure flow                                |

---

## Phase 11 Backlog — Statements

| #    | Task                                                           |
| ---- | -------------------------------------------------------------- |
| 11A1 | `GET /accounts/:accountNumber/statement?month=&year=` endpoint |
| 11A2 | Statement UI in customer portal                                |
| 11B1 | PDF generation endpoint (later)                                |

---

## Phase 12 Backlog — Beneficiaries

| #    | Task                                  |
| ---- | ------------------------------------- |
| 12A1 | Add `beneficiaries[]` to User model   |
| 12A2 | CRUD endpoints for beneficiaries      |
| 12A3 | Beneficiary selector in transfer form |

---

## Performance Backlog (non-blocking)

| #   | Item                                                                                    | Impact |
| --- | --------------------------------------------------------------------------------------- | ------ |
| P1  | `authorizeRoles` redundant `User.findById` — `req.user` already set by `authMiddleware` | Medium |
| P2  | Route auto-loader in `server.js`                                                        | Low    |
