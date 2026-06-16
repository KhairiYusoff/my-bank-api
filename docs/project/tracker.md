# Tracker

> **Scope:** Current phase focus + upcoming phase backlogs. History and phase goals live in [roadmap.md](roadmap.md) — this file only tracks what's active and what's next.

**Last Updated:** Jun 15, 2026
**Current Phase:** Phase 10 — Dormancy & Lifecycle

---

## Now — Phase 10: Dormancy & Lifecycle (in progress)

| Story    | Repo                   | Summary                                                           | Status | Story File |
| -------- | ---------------------- | ----------------------------------------------------------------- | ------ | ---------- |
| US-10001 | `my-bank-api`          | Account goes dormant after 12 months no activity (cron)           | ⬜     | —          |
| US-10002 | `my-bank-customer`     | Dormant account shows clear message with reactivation steps       | ⬜     | —          |
| US-10003 | `notification-service` | Customer notified at 11 months no activity (pre-dormancy warning) | ⬜     | —          |
| US-10004 | `my-bank-admin-portal` | Banker reactivates dormant account                                | ⬜     | —          |
| US-10005 | `my-bank-admin-portal` | Admin suspends a customer account                                 | ⬜     | —          |
| US-10006 | `my-bank-customer`     | Customer requests account closure                                 | ⬜     | —          |

---

## Completed

### Phase 9 — Fixed Deposit Module (Jun 2026) ✅

| Story   | Repo                                  | Summary                                                                                                       | Status | Commit |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ | ------ |
| US-9001 | `my-bank-api`                         | Unified Provisioning Engine — account request + banker approval                                               | ✅     | `ca5a041` |
| US-9002 | `my-bank-customer`, `my-bank-admin-portal` | FD Onboarding UI — customer request form + banker Approval Hub tab                                         | ✅     | `db361ff` |
| US-9003 | `my-bank-api`                         | Maturity & Renewal Engine — cron processing for FD maturity, interest crediting, renewal/grace periods        | ✅     | `be6d412` |
| US-9004 | `my-bank-customer`, `my-bank-api`     | Manual Principal Settlement — Customer withdraws principal during 7-day grace period                          | ✅     | `50a8c28` |
| US-9005 | `my-bank-customer`, `my-bank-api`     | Emergency Early FD Withdrawal — Breaking the lock with interest forfeiture                                    | ✅     | `e40bed2` |
| US-9006 | `my-bank-customer`, `my-bank-api`     | Manage FD Instructions — Toggle Auto-Renewal and update linked settlement account                             | ✅     | `50a8c28` |

### Phase 8 — Role Expansion (Jun 2026) ✅

| Story | Repo | Summary | Status |
| ----- | ---- | ------- | ------ |
| US-8001 | `my-bank-api` | Add `auditor` role — expand User model enum, update all `authorizeRoles()` calls per RBAC matrix | ✅ |
| US-8002 | `my-bank-api`, `my-bank-admin-portal` | Staff first-login flow — forced password change + basic profile setup | ✅ |
| US-8003 | `my-bank-api`, `my-bank-admin-portal` | Role-based access control — sidebar nav, route guards, dashboard cards, 403 page | ✅ |
| ~~US-8004~~ | — | ~~Enhance staff creation — phoneNumber, auto staffId, welcome email~~ — **dropped**; scope absorbed into future staff-management work if needed | ❌ dropped |

### Phase 7 — Account Type Differentiation (Jun 6–7, 2026) ✅

| Story | Repo | Summary | Commit |
| ----- | ---- | ------- | ------ |
| US-7001 | `my-bank-api` | Transfer & withdrawal rules — limits, overdraft, FD/status blocks | `785e6bb` Jun 7 2026 |
| ~~US-7002~~ | — | Dropped — Reg D not applicable to BNM; moved to Phase 14 | — |
| US-7003 | `my-bank-api`, `my-bank-admin-portal` | Banker sets overdraft limit via portal | `11d67bf` / `6cd0687` Jun 7 2026 |
| US-7005 | `my-bank-customer`, `my-bank-api` | Account type chip with limits tooltip; GET /accounts/limits endpoint | `63b3b05` / `023952f` Jun 7 2026 |
| US-7006 | `my-bank-api` | Monthly maintenance fee cron (1st of month, 00:01 MYT) | `3642e88` Jun 7 2026 |
| US-7007 | `my-bank-api` | Savings interest cron (last day of month, 23:59 MYT) | `3642e88` Jun 7 2026 |
| US-7008 | `my-bank-api` | Low balance alert utility — wired into withdraw + transfer | `3642e88` Jun 7 2026 |

Pre-Phase 7 bug fixes (BUG-01 to BUG-06) — `d42d94a` / `568db78` Jun 6 2026

### Phase 6 — Admin Detail Pages (Jun 2–5, 2026) ✅

All 5 stories done (including addendum US-6004 and US-6005).

- US-6001 `8c8610b`/`1718b45`, US-6002 `0b85e1d`/`27215ef`, US-6003 Jun 3 2026
- US-6004 `7f845dd` (FE) Jun 3 2026 — account transactions page, AppBreadcrumbs, formatCurrency fix
- US-6005 `42567e2` (BE) / `d013cda` (FE) Jun 5 2026 — enterprise dashboard (KPI, financials, attention)
- Hotfix `6ae743a` — currency locked to MYR at model/service/controller level + DB migration (17 records patched)

### Phase 5 — Transaction Enrichment (Jun 1, 2026) ✅

All 4 stories done.

### Documentation Rewrite (May 29, 2026) ✅

All D1–D6 tasks done. See roadmap.md for detail.

### Phase 3 — Client Coverage & Gap Closure (May 29, 2026) ✅

All 3A and 3B tasks done. See roadmap.md for detail.

### Phase 2 — Architecture Completion (May 25, 2026) ✅

All 2A–2D tasks done. See roadmap.md for detail.

### Phase 1 — Codebase Hardening (May 13–19, 2026) ✅

All 1A–1E tasks done. See roadmap.md for detail.

### Phase 0 — Foundation & Deployment (May 8–10, 2026) ✅

All services deployed. P0 bugs fixed. See roadmap.md for detail.

---

## Phase 5 Backlog — Transaction Enrichment (Next Code Phase)

| Story                                         | Repo                                       | Summary                                                                                                            | Status                              |
| --------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | ----------------------------------- |
| [US-5001](../user-stories/phase-5/US-5001.md) | `my-bank-api`                              | 12 new Transaction fields, Counter model, `maskName` utility, role-based API responses, `Account.currency` bug fix | ✅ `b60fffb` May 31 2026            |
| [US-5002](../user-stories/phase-5/US-5002.md) | `my-bank-customer`                         | Tappable transaction rows + receipt drawer, null handling for pre-Phase-5 records                                  | ✅ `b82a59d` Jun 1 2026             |
| [US-5003](../user-stories/phase-5/US-5003.md) | `my-bank-admin-portal`                     | Unmasked detail panel with deviceInfo, processingTime, duration                                                    | ✅ `1d4d6a3` Jun 1 2026             |
| [US-5004](../user-stories/phase-5/US-5004.md) | `my-bank-customer`, `my-bank-admin-portal` | Currency display standardised — all amounts show `RM X,XXX.XX`                                                     | ✅ `5dfd3fc` / `379ddfc` Jun 1 2026 |

---

## Phase 6 Backlog — Admin Detail Pages

| Story                                         | Repo                                  | Summary                                                                                                          | Status                              |
| --------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [US-6001](../user-stories/phase-6/US-6001.md) | `my-bank-api`, `my-bank-admin-portal` | Admin views full customer profile — `GET /admin/customer/:id` + detail page                                      | ✅ `8c8610b` / `1718b45` Jun 2 2026 |
| [US-6002](../user-stories/phase-6/US-6002.md) | `my-bank-api`, `my-bank-admin-portal` | Admin views staff profile — `GET /admin/staff/:id` + detail page                                                 | ✅ `0b85e1d` / `27215ef` Jun 2 2026 |
| [US-6003](../user-stories/phase-6/US-6003.md) | `my-bank-api`, `my-bank-admin-portal` | Admin views account detail — `GET /accounts/:accountNumber/detail` + detail page (depends US-6001)               | ✅ Jun 3 2026                       |
| [US-6004](../user-stories/phase-6/US-6004.md) | `my-bank-admin-portal`                | Admin views account transaction history — `/accounts/:accountNumber/transactions` + breadcrumb (depends US-6003) | ✅ `7f845dd` Jun 3 2026             |
| [US-6005](../user-stories/phase-6/US-6005.md) | `my-bank-api`, `my-bank-admin-portal` | Admin dashboard — KPI cards, financial snapshot, attention signals, portfolio AUM                                | ✅ `42567e2` / `d013cda` Jun 5 2026 |

---

## Phase 7 Backlog — Account Type Differentiation

## Pre-Phase 7 — Lifecycle Bug Fixes ✅ (Jun 6, 2026)

Discovered via full lifecycle audit. All critical/high bugs fixed before Phase 7 code starts.

| ID     | Sev      | Summary                                                                                                                                                      | Commit    |
| ------ | -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| BUG-01 | CRITICAL | Account type enum unified to `savings/current/business/fixed_deposit` across Account model, User model, validations, accountTypeMap. Migration script added. | see below |
| BUG-02 | CRITICAL | `verifyCustomer` wrapped in Mongoose session — user verify + account create are now atomic                                                                   | see below |
| BUG-03 | CRITICAL | `user.status` enforced in `loginUser()` and `authMiddleware` — suspended/terminated users blocked                                                            | see below |
| BUG-04 | CRITICAL | `CREATE_STAFF` added to `ActivityLog` enum — staff creation now auditable                                                                                    | see below |
| BUG-05 | HIGH     | Deferred to Phase 10 — requires product decision on soft vs hard delete                                                                                      | —         |
| BUG-06 | HIGH     | `account.status !== "Active"` guard added to `deposit()`, `withdraw()`, `transferFunds()`                                                                    | see below |

---

| Story                                         | Repo                                  | Summary                                                                                                                     | Status                              |
| --------------------------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| [US-7001](../user-stories/phase-7/US-7001.md) | `my-bank-api`                         | Transfer & withdrawal rules — limits, overdraft, FD/status blocks, model enum fix                                           | ✅ `785e6bb` Jun 7 2026             |
| ~~US-7002~~                                   | ~~`my-bank-api`~~                     | ~~Savings monthly withdrawal cap (max 4/month)~~ — dropped; Reg D not applicable to BNM; moved to Phase 14 as AML soft-flag | ❌ dropped                          |
| [US-7003](../user-stories/phase-7/US-7003.md) | `my-bank-api`, `my-bank-admin-portal` | Banker sets overdraft limit on Current/Business account via portal                                                          | ✅ `11d67bf` / `6cd0687` Jun 7 2026 |
| [US-7005](../user-stories/phase-7/US-7005.md) | `my-bank-customer`, `my-bank-api`     | Account type chip with limits tooltip in BalanceCard; GET /accounts/limits endpoint                                         | ✅ `63b3b05` / `023952f` Jun 7 2026 |
| [US-7006](../user-stories/phase-7/US-7006.md) | `my-bank-api`                         | Monthly maintenance fee deducted automatically (cron, 1st of month, MYT)                                                   | ✅ `3642e88` Jun 7 2026             |
| [US-7007](../user-stories/phase-7/US-7007.md) | `my-bank-api`                         | Savings interest credited monthly (cron, last day of month, MYT)                                                            | ✅ `3642e88` Jun 7 2026             |
| [US-7008](../user-stories/phase-7/US-7008.md) | `my-bank-api`                         | Low balance alert utility — wired into withdraw and transfer (debit leg)                                                    | ✅ `3642e88` Jun 7 2026             |

> **Note — US-7004 removed:** “Transfer blocked if daily limit exceeded” was a subset of US-7001. Merged; no separate story file.

---

## Phase 9 Backlog — Fixed Deposit Module

| Story   | Repo                                  | Summary                                                                                                       | Status | Story File                                       |
| ------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------ |
| US-9001 | `my-bank-api`                         | Unified Provisioning Engine — account request + banker approval (Account model only)                          | ✅     | [US-9001.md](../user-stories/phase-9/US-9001.md) |
| US-9002 | `my-bank-customer`, `my-bank-admin-portal` | FD Onboarding UI — customer request form + banker Approval Hub tab                                         | ⬜     | [US-9002.md](../user-stories/phase-9/US-9002.md) |
| US-9003 | `my-bank-api`                         | Maturity & Renewal Engine — Cron processing for FD maturity, interest crediting, and renewal/grace periods     | ⬜     | [US-9003.md](../user-stories/phase-9/US-9003.md) |

> Implement in order: US-9001 → US-9002 → US-9003.

---

## Phase 10 Backlog — Dormancy & Lifecycle

| Story    | Repo                   | Summary                                                           | Status |
| -------- | ---------------------- | ----------------------------------------------------------------- | ------ |
| US-10001 | `my-bank-api`          | Account goes dormant after 12 months no activity (cron)           | ⬜     |
| US-10002 | `my-bank-customer`     | Dormant account shows clear message with reactivation steps       | ⬜     |
| US-10003 | `notification-service` | Customer notified at 11 months no activity (pre-dormancy warning) | ⬜     |
| US-10004 | `my-bank-admin-portal` | Banker reactivates dormant account                                | ⬜     |
| US-10005 | `my-bank-admin-portal` | Admin suspends a customer account                                 | ⬜     |
| US-10006 | `my-bank-customer`     | Customer requests account closure                                 | ⬜     |

---

## Phase 11 Backlog — Statements

| Story    | Repo               | Summary                                                                    | Status |
| -------- | ------------------ | -------------------------------------------------------------------------- | ------ |
| US-11001 | `my-bank-customer` | Customer views monthly statement for any account                           | ⬜     |
| US-11002 | `my-bank-api`      | Statement shows opening/closing balance, credits, debits, transaction list | ⬜     |
| US-11003 | `my-bank-customer` | Customer downloads statement as PDF                                        | ⬜     |

---

## Phase 12 Backlog — Beneficiaries

| Story    | Repo               | Summary                                                       | Status |
| -------- | ------------------ | ------------------------------------------------------------- | ------ |
| US-12001 | `my-bank-customer` | Customer saves a beneficiary with nickname                    | ⬜     |
| US-12002 | `my-bank-customer` | Customer manages (add/edit/delete) beneficiaries              | ⬜     |
| US-12003 | `my-bank-customer` | Transfer form pre-fills account number from saved beneficiary | ⬜     |

---

## Phase 14 Backlog — Fraud & Risk (AML/CFT)

> Dedicated fraud detection phase. `riskFlags` field on Transaction is already schema-ready — this phase populates and surfaces it.

| Story    | Repo                                  | Summary                                                                                                                                           | Status |
| -------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| US-14001 | `my-bank-api`                         | BNM AML soft flags on withdrawals: `CTR_THRESHOLD_BREACH` (≥RM50k), `STRUCTURING_SUSPECTED` (RM40k–49,999), `RAPID_DRAIN` (≥50% balance in 1hr)   | ⬜     |
| US-14002 | `my-bank-api`                         | Velocity soft flags on transfers: `VELOCITY_BREACH` (5 transfers in 10 min), `NEW_RECIPIENT_HIGH_VALUE` (new recipient + amount >50% of type cap) | ⬜     |
| US-14003 | `my-bank-api`, `my-bank-admin-portal` | Admin flagged transactions dashboard — filter by riskFlag, date, account type                                                                     | ⬜     |
| US-14004 | `my-bank-api`, `notification-service` | Compliance alert sent to admin when `CTR_THRESHOLD_BREACH` or `STRUCTURING_SUSPECTED` is triggered                                                | ⬜     |

---

## Phase 13 Backlog — AI Assistant

| Story    | Repo               | Summary                                                    | Status |
| -------- | ------------------ | ---------------------------------------------------------- | ------ |
| US-13001 | `my-bank-customer` | Customer asks AI questions about accounts and transactions | ⬜     |
| US-13002 | `my-bank-customer` | AI chat history persists across page navigation            | ⬜     |
| US-13003 | `my-bank-api`      | AI answers based on user's actual data, not generic        | ⬜     |
| US-13004 | `my-bank-api`      | AI responds without unprompted disclaimers                 | ⬜     |
| US-13005 | `my-bank-customer` | AI chat cleared on logout                                  | ⬜     |

---

## Tech Debt — Enum Normalisation (pending)

Code and docs are out of sync with production DB. **Resolve before US-9001 implementation.**

| Item | Code today | Target (`business-rules.md`) | Action |
| ---- | ---------- | ---------------------------- | ------ |
| `Account.accountType` | ~~`Savings` / `Checking` / `Business`~~ | `savings` / `current` / `business` / `fixed_deposit` | ✅ Dev DB migrated (22 records) — re-run `node scripts/migrateAccountTypes.js` on staging/prod |
| `Account.status` | ~~`Active` / `Dormant` / `Closed`~~ | `pending_approval` / `active` / `dormant` / `suspended` / `closed` / `pending_closure` | ✅ Code migrated — run `node scripts/migrateAccountStatus.js` on each DB |
| `schema-overview.md` | Stale (missing `auditor`) | Match live models | ✅ Status enum updated; auditor role still pending in schema doc |

**Why migrate status now (not later):** Phase 9 needs `pending_approval`. Phase 10 needs `suspended` and `pending_closure`. Adding PascalCase variants (`Pending_approval`) would compound the mess. `User.status` already uses lowercase — Account should match.

**FD `matured` is NOT an account lifecycle status.** Keep lifecycle on `account.status`; track FD maturity state via `maturityDate` + optional `fdMaturedAt` timestamp (US-9003). Roadmap item `status: active\|matured\|withdrawn` refers to FD product state, not the dormancy lifecycle enum.

---

## Performance Backlog (non-blocking)

| #   | Item                                                                                    | Impact |
| --- | --------------------------------------------------------------------------------------- | ------ |
| P1  | `authorizeRoles` redundant `User.findById` — `req.user` already set by `authMiddleware` | Medium |
| P2  | Route auto-loader in `server.js`                                                        | Low    |

---

## Infrastructure — Pending Action: Migrate API from Render to Fly.io

**Why:** Render free tier sleeps after 15 minutes of inactivity. `node-cron` jobs (US-7006 maintenance fee, US-7007 savings interest) are missed when the server is asleep. For cron jobs to run reliably in production, the server must be always-on.

**Action required:** Migrate `my-bank-api` from Render to Fly.io before Phase 7 cron jobs are considered production-ready.

### Free tier hosting options — no forced sleep

| Platform         | Free tier         | Sleeps? | Cron reliable? | Notes                                                           |
| ---------------- | ----------------- | ------- | -------------- | --------------------------------------------------------------- |
| **Fly.io**       | 3 shared VMs free | ❌ No   | ✅ Yes         | **Recommended** — genuinely always-on, uses existing Dockerfile |
| **Koyeb**        | 1 free instance   | ❌ No   | ✅ Yes         | Simple deploy, good DX                                          |
| **Railway**      | $5 credit/month   | ❌ No   | ✅ Yes         | Credit usually covers a small API                               |
| Render (current) | Free tier         | ✅ Yes  | ❌ Unreliable  | Sleeps after 15min idle                                         |
| Vercel           | Serverless only   | N/A     | ❌ No          | Frontend/Lambda only — no persistent process                    |

### Migration steps (Fly.io)

```bash
# Install flyctl
brew install flyctl

# Login
fly auth login

# From my-bank-api root (Dockerfile already exists)
fly launch        # detects Dockerfile, creates fly.toml
fly secrets set PORT=5000 MONGO_URI=... JWT_SECRET=... # copy from Render env vars
fly deploy

# Update VITE_API_URL in Vercel + my-bank-admin-portal to point to new Fly.io URL
```

**Status:** ⬜ Not started — do after Phase 7 crons are implemented and tested locally.
