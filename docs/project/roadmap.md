# MyBank API — Roadmap

A permanent record of where this project has been, where it is, and where it's going.
Tracker handles *what's being worked on right now*. This file handles *the full journey*.

For a complete index of individual story statuses, see [user-stories.md](../product/user-stories.md).

---

## Phase 0 — Foundation & Deployment ✅ (May 8–10, 2026)

**Goal:** Get all services live and observable.

- **Status:** Completed ✅
- **Key Milestones:**
  - `my-bank-api` deployed to Railway/Render.
  - `my-bank-admin-portal` deployed to Vercel.
  - `notification-service` deployed to Railway/Render.
  - Resolved P0 WebSockets CORS, trust proxy warnings, and notification JWT proxy alignment.

---

## Phase 1 — Codebase Hardening ✅ (May 13–19, 2026)

**Goal:** Clean up the codebase so all future work is built on solid foundations. No features — structural only.

- **Status:** Completed ✅
- **Key Milestones:**
  - **Dead Code Removed:** Deleted duplicate transaction and expense services.
  - **Naming Standardised:** Renamed 11 files in shared directories to use `.dot` notation; updated 19 import paths.
  - **Duplicate Middleware Eliminated:** Removed duplicate middlewares in `accounts` and `users` modules.
  - **Fat Controllers Extracted:** Created dedicated services (`account.service.js`, `user.service.js`, `admin.service.js`) and simplified controllers.
  - **Consistency Audit:** Applied `handleError` and `success()` / `error()` utilities system-wide.

---

## Phase 2 — Architecture Completion ✅ (Completed May 25, 2026)

**Goal:** Every module follows the route → controller → service contract without exception.

- **Status:** Completed ✅
- **Key Milestones:**
  - Standardized local `handleError` copies with shared `error()` utility across all 6 controllers.
  - Extracted logic into `auth.service.js`, `onboarding.service.js`, and `audit.service.js`.

---

## Phase 3 — Client Coverage Audit & Gap Closure ✅ (Completed May 29, 2026)

**Goal:** Every API endpoint is either consumed by a client or deliberately removed/documented as internal-only.

- **Status:** Completed ✅
- **Key Milestones:**
  - Conducted full cross-reference of all routes vs client calls.
  - Wired staff management (`PUT/DELETE` staff routes) and customer management actions.
  - Completed Transaction detail modal and standard account views.
  - Formally deferred unused routes (`DELETE /users/me` and AI chat endpoints).

---

## Phase 4 — AI Features ⏸️ (ON HOLD)

**Goal:** Wire AI chat and proactive advisor engines.

- **Status:** Paused indefinitely (ON HOLD) ⏸️
- **Gate:** Phases 5–12 must ship before Phase 13/14 AI features can start. Scaffolded endpoints are preserved but inactive.

---

## Phase 5 — Transaction Enrichment ✅ (Completed June 1, 2026)

**Goal:** Every transaction record captures complete contextual data at write time (reference, counterpart, running balance, channel, device) for receipts and fraud auditing.

- **Status:** Completed ✅
- **Scope:** [US-5001] to [US-5004] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Added 12 new fields to Transaction schema and created `Counter` model.
  - Built receipt drawer UI in customer portal.
  - Created unmasked details view in admin portal.
  - Standardized currency formatting (`RM X,XXX.XX`).

---

## Phase 6 — Admin Detail Pages ✅ (Completed June 3, 2026)

**Goal:** Replace Actions dropdown on admin/staff lists with dedicated details pages showing full customer KYC profiles and account details.

- **Status:** Completed ✅
- **Scope:** [US-6001] to [US-6005] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Added detail pages for customers, staff profiles, and bank accounts.
  - Built admin Enterprise Dashboard showing KPIs, financials, and AUM.
  - Standardized all transactions to MYR.

---

## Phase 7 — Account Type Differentiation ✅ (Completed June 7, 2026)

**Goal:** Enforce differentiated rules (limits, overdrafts, interest) per account type in code.

- **Status:** Completed ✅
- **Scope:** [US-7001] to [US-7008] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Unified account type enums (`savings`, `current`, `business`, `fixed_deposit`).
  - Implemented limits, overdraft checks, and monthly maintenance fee / savings interest cron jobs.
  - Integrated `notifyBelowThreshold` utility.

---

## Phase 8 — Role Expansion (4 Roles) ✅ (Completed June 14, 2026)

**Goal:** Expand admin portal support to 4 distinct roles (`admin`, `banker`, `auditor`, `customer`) with RBAC and forced staff password reset.

- **Status:** Completed ✅
- **Scope:** [US-8001] to [US-8003] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Integrated `auditor` role into all authorization guards.
  - Created staff first-login setup and password reset flows.
  - Wired role-based sidebar navigation and route guards.

---

## Phase 9 — Fixed Deposit Module ✅ (Completed June 15, 2026)

**Goal:** Full Fixed Deposit product — lock period, maturity, interest crediting, early withdrawal, auto-renewal.

- **Status:** Completed ✅
- **Scope:** [US-9001] to [US-9006] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Added FD principal, duration, interest rate, renewal instructions, and status.
  - Developed Unified Provisioning Engine for account requests and banker approvals.
  - Built maturity cron (credits interest, triggers renewal/grace periods).
  - Built early withdrawal (forfeits interest) and settlement features.

---

## Phase 10 — Dormancy Cron & Account Lifecycle 🔵 (In Progress)

**Goal:** Full account lifecycle enforcement — dormancy automation, suspension, request-based closure.

- **Status:** Active / In Progress 🔵
- **Scope:** [US-10001] to [US-10006] (detailed in [user-stories.md](../product/user-stories.md)).
- **Key Milestones:**
  - Automated dormancy identification cron (12 months inactivity).
  - Annual dormancy fee (RM10/year) debit mechanism.
  - Administrative suspension/reactivation endpoints and UI.
  - Customer-requested account closure workflow (zero balance check).

---

## Phase 11 — Monthly Statements 🔴 (Backlog)

**Goal:** On-demand monthly statements and PDF statements.

- **Status:** Planned ⬜
- **Scope:** [US-11001] to [US-11003].
- **Key Features:**
  - Statement summary endpoint (`GET /accounts/:accountNumber/statement`).
  - Monthly statement history UI.
  - Server-side PDF generation (`pdfkit` or `puppeteer`).

---

## Phase 12 — Beneficiary Management 🔴 (Backlog)

**Goal:** Customer can save frequent recipients for quick transfers.

- **Status:** Planned ⬜
- **Scope:** [US-12001] to [US-12003].
- **Key Features:**
  - Recipient directory in customer profile (max 20).
  - Transfer form beneficiary autocompletion.

---

## Phase 13 — AI Enhancement 🔴 (Backlog)

**Goal:** Production-grade contextual AI chat for customers.

- **Status:** Planned ⬜
- **Scope:** [US-13001] to [US-13005].
- **Key Features:**
  - Redux-persisted AI chat UI.
  - Injection of user account balances and transactions as prompt context.
  - AI responses personalized to customer data.

---

## Phase 14 — AI Phase 2 & Advanced Risk 🔴 (Backlog)

**Goal:** Proactive AI agent capabilities and advanced transaction monitoring (AML/CFT).

- **Status:** Planned ⬜
- **Scope:** [US-14001] to [US-14004] (Risk) and proactive AI alerts.
- **Key Features:**
  - BNM AML soft flags (threshold breaches, structuring alerts, rapid drains).
  - Proactive AI notifications (low balance, unusual category spend alerts).
