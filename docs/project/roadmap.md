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

## Phase 3 — AI Features 🔵 (Current)

**Goal:** Production-grade AI features in the banking context.

Scaffolding already exists: `ai.controller.js`, `ai.service.js`, `ai.guardrails.js`, `ai.tools.js`.

- [ ] RAG setup — knowledge base integration in my-bank-api
- [ ] AI chatbot UI — my-bank-customer
- [ ] Financial insights — spending breakdown with AI narrative

**Gate:** Phase 2 closed on May 25, 2026. Phase 3 is now active.

---

## Phase 4+ — TBD

Future scope to be defined after Phase 3 ships.
