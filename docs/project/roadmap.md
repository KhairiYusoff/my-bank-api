# MyBank API — Roadmap

A permanent record of where this project has been, where it is, and where it's going.
Tracker handles _what's being worked on right now_. This file handles _the full journey_.

---

## Phase 0 — Foundation & Deployment ✅ (May 8–10, 2026)

**Goal:** Get all services live and observable.

- my-bank-api → deployed (Railway/Render)
- my-bank-admin-portal → deployed (Vercel)
- notification-service → deployed (Railway/Render)
- P0 bug: transfer recipient bell icon not updating in real-time → fixed
- P0 bug: WebSocket CORS blocking localhost in dev → fixed
- P0 bug: trust proxy + Mongoose deprecation warnings on Render → fixed
- P0 bug: notification proxy routes misaligned with JWT payload → fixed

---

## Phase 1 — Codebase Hardening ✅ (May 13–19, 2026)

**Goal:** Clean up the codebase so all future work is built on solid foundations. No features — structural only.

### 1A — Dead Code Removed (May 15)

- Deleted `shared/services/transactionService.js` (duplicate of module-level service)
- Deleted `shared/services/expenseService.js` (duplicate)
- Deleted `shared/constants/expense.js` (zero imports)
- Rewired `transaction.controller` + `expense.controller` to their local module services

### 1B — Naming Standardised (May 15)

- 11 files renamed in `shared/middleware/`, `shared/services/`, `shared/utils/` to `dot.notation`
- 19 import paths updated across all modules + `server.js`

### 1C — Duplicate Middleware Eliminated (May 15)

- Deleted `modules/accounts/account.middleware.js` (identical to shared)
- Deleted `modules/users/user.middleware.js` (identical to shared)

### 1D — Fat Controllers Extracted (May 18)

- `account.service.js` created — `account.controller.js`: 526 → 149 lines
- `user.service.js` created — `user.controller.js`: 348 → 113 lines
- `admin.service.js` created — `admin.controller.js`: 160 → 67 lines
- All 3 controllers now HTTP-only: extract params → call service → respond

### 1E — Consistency Audit (May 19)

- `handleError` + `err.statusCode` pattern applied to all controllers
- `success()/error()` utilities applied everywhere
- `exports.fn` pattern standardised (removed all `module.exports = {}` style)
- `getAllTransactions` DB logic moved from controller to `transaction.service.js`

---

## Phase 2 — Architecture Completion ✅ (Completed May 25, 2026)

**Goal:** Every module follows the route → controller → service contract without exception.

Audit (May 22, 2026) found 4 remaining gaps:

| #   | Module        | Issue                                                                                                                                     |
| --- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| 2A  | `auth`        | No `auth.service.js` — login, logout, refreshToken all fat controllers touching User model directly                                       |
| 2B  | `onboarding`  | Service only has email helpers — apply, completeProfile, verifyCustomer, getPendingApplications are fat controllers with direct DB access |
| 2C  | `audit`       | Service only covers writes — getOwnActivity, getUserActivity, getAllActivities have pagination/filter/sort logic in controller            |
| 2D  | 6 controllers | Local `handleError` copies instead of shared `error()` utility — violates constraint #1                                                   |

**Result (May 25, 2026):** All 4 gaps closed.

- ✅ 2D complete: Replaced local `handleError` copies with shared `error()` utility in 6 controllers
- ✅ 2A complete: Created `auth.service.js`; controller now HTTP-only
- ✅ 2B complete: Expanded `onboarding.service.js`; controller now HTTP-only
- ✅ 2C complete: Expanded `audit.service.js` with shared `_queryLogs` read builder; controller now HTTP-only

---

## Phase 3 — Client Coverage Audit & Gap Closure 🔵 (Current)

**Reprioritised May 29, 2026** — core banking must be fully wired before AI features. Triggered by P0 bug: `GET /transactions/account/:accountNumber` silently returning empty data for all users due to schema mismatch introduced in Phase 1 refactor.

**Goal:** Every API endpoint is either consumed by a client or deliberately removed/documented as internal-only.

**Goal:** Every API endpoint is either consumed by a client or deliberately removed/documented as internal-only. Discovered May 29, 2026 after `GET /transactions/account/:accountNumber` returned empty data for all users — root cause was a schema mismatch introduced in the Phase 1 refactor that went undetected because uncalled fields return silently empty results.

### Audit findings (May 29, 2026)

Full cross-reference of all routes vs client calls (my-bank-customer + my-bank-admin-portal):

| Endpoint                                   | Method       | Status                                            |
| ------------------------------------------ | ------------ | ------------------------------------------------- |
| `POST /auth/login`                         | both clients | ✅                                                |
| `POST /auth/logout`                        | both clients | ✅                                                |
| `POST /auth/refresh-token`                 | admin        | ✅                                                |
| `GET /auth/check-token`                    | customer     | ✅                                                |
| `GET /users/me`                            | both clients | ✅                                                |
| `PUT /users/me`                            | both clients | ✅                                                |
| `PUT /users/me/password`                   | both clients | ✅                                                |
| `PUT /users/me/preferences`                | admin        | ✅                                                |
| `POST /users/me/reset-password`            | customer     | ✅                                                |
| `DELETE /users/me`                         | —            | ❌ **unused**                                     |
| `GET /users/customers`                     | admin        | ✅                                                |
| `GET /users/staff`                         | admin        | ✅                                                |
| `POST /accounts/create`                    | —            | ❌ **unused** (banker feature, no UI)             |
| `DELETE /accounts/:accountNumber`          | —            | ❌ **unused** (banker feature, no UI)             |
| `GET /accounts/`                           | —            | ❌ **unused** (customer list accounts, not wired) |
| `GET /accounts/balance/:accountNumber`     | —            | ❌ **unused**                                     |
| `GET /accounts/all`                        | admin        | ✅                                                |
| `POST /accounts/deposit`                   | customer     | ✅                                                |
| `POST /accounts/withdraw`                  | customer     | ✅                                                |
| `POST /accounts/airdrop`                   | admin        | ✅                                                |
| `POST /transactions/transfer`              | customer     | ✅                                                |
| `GET /transactions/account/:accountNumber` | customer     | ✅ (fixed May 29)                                 |
| `GET /transactions/all`                    | admin        | ✅                                                |
| `GET /transactions/:transactionId`         | —            | ❌ **unused**                                     |
| `POST /expenses`                           | customer     | ✅                                                |
| `GET /expenses`                            | customer     | ✅                                                |
| `GET /expenses/:expenseId`                 | customer     | ✅                                                |
| `PUT /expenses/:expenseId`                 | customer     | ✅                                                |
| `DELETE /expenses/:expenseId`              | customer     | ✅                                                |
| `GET /expenses/analytics/monthly`          | customer     | ✅                                                |
| `GET /expenses/analytics/yearly`           | customer     | ✅                                                |
| `GET /expenses/categories`                 | —            | ❌ **unused**                                     |
| `GET /expenses/payment-methods`            | —            | ❌ **unused**                                     |
| `GET /expenses/dashboard/stats`            | —            | ❌ **unused**                                     |
| `POST /ai/chat`                            | —            | ❌ **unused** (Phase 3 work in progress)          |
| `GET /ai/insights`                         | customer     | ✅                                                |
| `GET /audit/me`                            | admin        | ✅                                                |
| `GET /audit/user/:userId`                  | admin        | ✅                                                |
| `GET /audit/all`                           | admin        | ✅                                                |
| `POST /onboarding/apply`                   | customer     | ✅                                                |
| `PUT /onboarding/complete-profile`         | customer     | ✅                                                |
| `GET /onboarding/pending`                  | admin        | ✅                                                |
| `POST /onboarding/approve/:userId`         | admin        | ✅                                                |
| `POST /onboarding/verify/:userId`          | admin        | ✅                                                |
| `POST /admin/create-staff`                 | admin        | ✅                                                |
| `DELETE /admin/staff/:staffId`             | —            | ❌ **unused** (no UI)                             |
| `DELETE /admin/customer/:customerId`       | —            | ❌ **unused** (no UI)                             |
| `PUT /admin/staff/:staffId`                | —            | ❌ **unused** (no UI)                             |
| `PUT /admin/customer/:customerId`          | —            | ❌ **unused** (no UI)                             |
| `GET /notifications/`                      | customer     | ✅                                                |
| `PATCH /notifications/:id`                 | customer     | ✅                                                |
| `DELETE /notifications/:id`                | customer     | ✅                                                |

### Work items

- [x] Wire `PUT /admin/staff/:staffId` + `DELETE /admin/staff/:staffId` — ✅ May 29
- [x] Wire `PUT /admin/customer/:customerId` + `DELETE /admin/customer/:customerId` — ✅ May 29
- [x] Wire `GET /transactions/:transactionId` — detail dialog in admin TransactionsList — ✅ May 29
- [ ] Wire `GET /accounts/` in customer app (account list on dashboard)
- [ ] Wire `GET /accounts/balance/:accountNumber` or confirm replaced by full account fetch
- [ ] Build banker account management UI in admin portal — `POST /accounts/create`, `DELETE /accounts/:accountNumber`
- [ ] Wire `DELETE /users/me` — account self-deletion flow in customer app
- [ ] Wire `GET /expenses/categories` + `GET /expenses/payment-methods` — use as filter options in expense UI
- [ ] Wire `GET /expenses/dashboard/stats` — expense summary widget
- [ ] `POST /ai/chat` — deferred to Phase 4

### 3A — Admin Portal gap closure ✅ (May 29, 2026)

Priority order based on impact:

1. **Staff management actions** — `PUT /admin/staff/:staffId`, `DELETE /admin/staff/:staffId`
   - Edit staff details (name, role, status)
   - Deactivate / remove staff
2. **Customer management actions** — `PUT /admin/customer/:customerId`, `DELETE /admin/customer/:customerId`
   - Edit customer details
   - Deactivate / remove customer account
3. **Transaction detail modal** — `GET /transactions/:transactionId`
   - Drill into a transaction from the transactions list
4. **Account management** — `POST /accounts/create`, `DELETE /accounts/:accountNumber`
   - Banker creates/closes accounts from admin portal

### 3B — Customer app gap closure 🔵 (current focus)

Audit (May 29, 2026) found most items already wired:

- [x] `GET /accounts/` — consumed in Dashboard, transfer, withdraw, deposit, expense hooks — ✅
- [x] `GET /accounts/balance/:accountNumber` — `useGetAccountBalanceQuery` in `AccountDetailsPage` — ✅
- [x] `GET /expenses/categories` — consumed in `useExpenseActions` — ✅
- [x] `GET /expenses/payment-methods` — consumed in `useExpenseActions` — ✅
- [x] `GET /expenses/dashboard/stats` — consumed in `useAnalytics` — ✅
- [ ] `DELETE /users/me` — API endpoint exists, no UI wired in customer app

---

## Phase 4 — AI Features 🔴 (Backlog)

**Goal:** Production-grade AI features in the banking context.

Scaffolding already exists: `ai.controller.js`, `ai.service.js`, `ai.guardrails.js`, `ai.tools.js`.

- [ ] RAG setup — knowledge base integration in my-bank-api
- [ ] AI chatbot UI — my-bank-customer (`POST /ai/chat`)
- [ ] Financial insights — spending breakdown with AI narrative

**Gate:** Phase 3 must be fully closed before Phase 4 starts.

---

## Phase 5+ — TBD

Future scope to be defined after Phase 4 ships.
