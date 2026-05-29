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

## Phase 4 — AI Features ⏸️ (ON HOLD)

**Paused indefinitely.** Core banking must reach Phase 10 (Beneficiary Management) before AI features are prioritised. Existing scaffolding (`ai.controller.js`, `ai.service.js`, `ai.guardrails.js`, `ai.tools.js`) is preserved but no new AI work until gate is cleared.

**Gate:** Phases 5–10 must ship before Phase 11 starts.

---

## Phase 5 — Transaction Detail Enrichment 🔴 (Next Up)

**Goal:** Transaction details must be meaningfully different from the list view — on par with Maybank2u / CIMB Clicks standard. Identified May 29, 2026 after BA review found the detail dialog showed identical data to the list.

### Context

The Phase 1 refactor replaced `fromAccountNumber`/`toAccountNumber` string fields with a single `account: ObjectId` ref. This lost counterpart information for transfers. A customer seeing "Transfer — RM500" with no recipient info is a UX failure and a dispute risk.

### 5A — Schema enrichment (my-bank-api)

Changes to `Transaction` model and `transferFunds` service:

| Field                | Type                           | Description                                                                | Priority |
| -------------------- | ------------------------------ | -------------------------------------------------------------------------- | -------- |
| `reference`          | `String`                       | Human-readable ID e.g. `TXN-20260529-00142`. Auto-generated at write time. | 🔴 MVP   |
| `counterpartAccount` | `String`                       | The other account number — recipient if sent, sender if received           | 🔴 MVP   |
| `counterpartName`    | `String`                       | Masked name of counterpart e.g. `Ahmad K****`                              | 🔴 MVP   |
| `balanceAfter`       | `Number`                       | Account balance snapshot after transaction completes                       | 🔴 MVP   |
| `fee`                | `Number`                       | Fee charged (default 0). Reserved for fee engine in Phase 6                | 🔴 MVP   |
| `category`           | `String`                       | Auto-derived from type: transfer/deposit/withdraw/fee                      | 🟡 Nice  |
| `processingTime`     | `{ submittedAt, completedAt }` | Timestamps for submission and completion                                   | 🟡 Nice  |
| `deviceInfo`         | `{ ip, userAgent }`            | Source IP + user agent — admin/fraud view only                             | 🟡 Nice  |

All new fields must have defaults (null/0) so existing documents don't break.

### 5B — account.service.js enrichment

Update 3 `new Transaction({...})` blocks in `account.service.js` (deposit, withdraw, airdrop) to populate `reference`, `balanceAfter`, `fee: 0`, `category`.

### 5C — Transaction detail UI (my-bank-customer)

Full-detail receipt view per transaction:

- Reference number: `TXN-20260529-00142`
- Counterpart name and masked account number
- Amount + balance after: `RM500.00 sent → Balance: RM2,450.00`
- Status with submitted/completed timestamps
- Fee breakdown (even if RM0.00)

### 5D — Transaction detail UI (my-bank-admin-portal)

Admin/banker view shows everything unmasked — counterpart full name, account, IP, device info for fraud investigation.

---

## Phase 6 — Account Type Differentiation 🔴 (Backlog)

**Goal:** Enforce differentiated rules per account type in code. Currently all accounts behave identically regardless of type.

### Work items

- [ ] Enforce min balance on account creation per type
- [ ] Enforce daily transfer limits per account type (Savings: RM10k, Current: RM20k, Business: RM50k)
- [ ] Enforce max single transfer per account type
- [ ] Enforce savings monthly withdrawal counter (max 4 — reset on 1st of month)
- [ ] Enforce overdraft limits for Current/Business (banker-set, default 0)
- [ ] FD accounts: block all transfers
- [ ] Dormant accounts: block all transactions
- [ ] Monthly maintenance fee cron (1st of month, skip if balance ≥ threshold)
- [ ] Savings interest cron (last day of month, credit based on balance tier)
- [ ] Add `overdraftLimit` field to `Account` model
- [ ] Add `monthlyWithdrawalCount` + `lastWithdrawalMonthReset` to `Account` model for Savings cap

**Gate:** Phase 5 must ship first (balance-after field required for fee transactions).

---

## Phase 7 — Fixed Deposit Module 🔴 (Backlog)

**Goal:** Full Fixed Deposit product — lock period, maturity, interest crediting, early withdrawal, auto-renewal.

### Work items

- [ ] New FD model fields: `principal`, `lockPeriod`, `maturityDate`, `interestRate`, `linkedAccount`, `autoRenew`, `status: active|matured|withdrawn`
- [ ] FD creation endpoint — validates min RM1,000, lock period (1/3/6/12 months), deducts from source account
- [ ] Maturity cron (daily at 02:00): marks FD as `matured`, sends notification
- [ ] Interest crediting on maturity: credit `principal + interest` to linked account
- [ ] Auto-renewal: if no action within 7 days of maturity, renew for same period at current rate
- [ ] Early withdrawal endpoint: return principal only, forfeit interest
- [ ] FD detail page in customer portal: maturity date, expected interest, lock period
- [ ] FD notification: 7 days before maturity + on maturity day

---

## Phase 8 — Dormancy Cron & Account Lifecycle 🔴 (Backlog)

**Goal:** Full account lifecycle enforcement — dormancy, suspension, closure.

### Work items

- [ ] Dormancy cron (daily at 02:00): mark accounts dormant after 12 months no activity
- [ ] Dormant accounts: block all transactions (transfer, deposit, withdraw)
- [ ] Dormancy fee cron: charge RM10/year on dormancy anniversary
- [ ] Reactivation endpoint: banker action — `PUT /accounts/:accountNumber/reactivate`
- [ ] Account suspension: admin action — `PUT /accounts/:accountNumber/suspend`
- [ ] Account closure flow: customer requests → banker approves → zero balance required
- [ ] Closed accounts hidden from customer portal, preserved in DB
- [ ] Notify customer when account becomes dormant (T-30 days warning)
- [ ] Status audit trail: all status changes logged with actor + timestamp

---

## Phase 9 — Monthly Statements 🔴 (Backlog)

**Goal:** On-demand monthly statement endpoint. PDF generation in Phase 9B.

### Work items

**9A — Statement endpoint**

- [ ] `GET /accounts/:accountNumber/statement?month=5&year=2026`
- [ ] Response: `{ openingBalance, closingBalance, totalCredits, totalDebits, transactionCount, transactions[] }`
- [ ] Restrict to account owner (customer) or admin/banker
- [ ] Statement UI in customer portal — monthly selector, summary header, transaction list

**9B — PDF generation** (later)

- [ ] Server-side PDF via `pdfkit` or `puppeteer`
- [ ] `GET /accounts/:accountNumber/statement/pdf?month=5&year=2026` — streams PDF
- [ ] Download button in statement UI

---

## Phase 10 — Beneficiary Management 🔴 (Backlog)

**Goal:** Customer can save frequent recipients for quick transfers.

### Work items

- [ ] Add `beneficiaries: [{ nickname, accountNumber, addedAt }]` to `User` model (max 20)
- [ ] `GET /users/me/beneficiaries` — list saved beneficiaries
- [ ] `POST /users/me/beneficiaries` — add new beneficiary (no verification, fails at transfer time if invalid)
- [ ] `PUT /users/me/beneficiaries/:id` — update nickname
- [ ] `DELETE /users/me/beneficiaries/:id` — remove beneficiary
- [ ] Transfer form: beneficiary selector dropdown pre-fills account number field
- [ ] Beneficiary list page in customer portal

---

## Phase 11 — AI Enhancement 🔴 (Backlog)

**Gate:** Phases 5–10 must ship first.

**Goal:** Wire the existing AI chat endpoint with proper client-side persistency and contextual personalisation. The AI scaffolding already exists — this phase makes it production-grade.

### Work items

- [ ] Wire `POST /ai/chat` in customer portal
- [ ] Chat history stored in Redux — survives navigation, cleared on logout/refresh
- [ ] Inject user's account balances + recent transactions as context in each request
- [ ] Remove generic "this is not financial advice" disclaimers from default responses
- [ ] AI responses personalised to user's actual data (not generic)
- [ ] Chat UI: message thread, input box, loading state, error state
- [ ] System prompt updated to reflect contextual banking assistant persona

---

## Phase 12 — AI Phase 2 🔴 (Backlog)

**Gate:** Phase 11 must ship first.

**Goal:** Proactive, agentic AI capabilities.

### Work items

- [ ] Proactive nudges — AI-generated alerts (e.g. "Your balance is low", "Unusual spend in Food this month")
- [ ] Spend insights — AI narrative on monthly spending breakdown
- [ ] Agentic advisor — multi-turn goal-oriented conversations (e.g. "help me save RM500 this month")
- [ ] Notification integration — proactive nudges delivered via notification service
