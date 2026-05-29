# MyBank — Problem & Product Brief

---

## Problem

**Background:** Traditional banking is fragmented across web, mobile, and offline channels. For young professionals and students in Malaysia, there's no unified, transparent banking platform that combines:

- Account management (savings, checking)
- Transaction tracking
- Expense categorization
- Onboarding verification (digital KYC)
- Admin/banker controls

**Who has this problem:** Young professionals, students, self-employed individuals who want digital-first banking without complexity.

**Why now:** The tech stack exists (MongoDB, Node.js, React), and there's demand for fintech solutions in Malaysia (growing digital adoption).

---

## What We're Building

**MyBank** — A full-stack Malaysian digital banking simulation, built to real-world banking standards:

- **Customer Portal** (React, Vite) — Multi-account management, transfers, transaction receipts, statements, beneficiaries, expense tracking, AI financial assistant
- **Admin Portal** (React, Vite) — Application approval, user/staff management, account operations, audit trails, transaction oversight
- **Core API** (Node.js, Express) — Full banking logic: account types with differentiated rules, transaction limits, fee engine, interest crediting, account lifecycle, atomic money operations
- **Notification Service** (Node.js, Express) — Decoupled event notifications via WebSocket
- **AI Assistant** (Phase 11+) — Contextual financial chat with user data awareness, persistent across navigation

---

## Scope (Current — Full Banking System)

### Features ✅ Built

| Feature                  | Scope                                                           | Status   |
| ------------------------ | --------------------------------------------------------------- | -------- |
| **Auth**                 | Login, JWT tokens, httpOnly cookies, refresh                    | ✅ Built |
| **Onboarding**           | Digital application, KYC verification, profile completion       | ✅ Built |
| **Accounts**             | Create, view, balance, account types (Savings/Current/Business) | ✅ Built |
| **Transactions**         | Transfer between accounts, view history, pagination             | ✅ Built |
| **Deposits/Withdrawals** | Banker deposits, customer withdraws                             | ✅ Built |
| **Airdrop**              | Admin credits accounts (promo/testing)                          | ✅ Built |
| **Expenses**             | Track and categorize user expenses                              | ✅ Built |
| **Admin Functions**      | Approve applications, manage users/staff, audit trails          | ✅ Built |
| **Audit Logging**        | All HIGH-severity actions logged                                | ✅ Built |
| **Notifications**        | Real-time WebSocket notifications                               | ✅ Built |

### In Progress / Planned (Core Banking)

| Feature                                                                | Phase    |
| ---------------------------------------------------------------------- | -------- |
| Transaction enrichment — reference, counterpart, balanceAfter          | Phase 5  |
| Account type rules — differentiated limits, overdraft, withdrawal caps | Phase 6  |
| Fixed Deposit — lock period, maturity, interest, cron crediting        | Phase 7  |
| Dormancy cron + full account lifecycle enforcement                     | Phase 8  |
| Monthly statements — summary endpoint + PDF                            | Phase 9  |
| Beneficiary management                                                 | Phase 10 |
| AI enhancement — chat persistency, contextual responses                | Phase 11 |
| AI Phase 2 — proactive nudges, agentic advisor                         | Phase 12 |

### Intentionally Out of Scope

- ❌ Mobile app (web-responsive only)
- ❌ Interbank transfers (FPX, IBG, DuitNow) — same-bank only
- ❌ Real KYC verification (Jumio etc.)
- ❌ Real payment gateway (Stripe/Razorpay)
- ❌ Credit scoring / loan products
- ❌ Investment products (Unit Trusts, ASB) — future after FD foundation
- ❌ Bill payments — future
- ❌ 2FA — future
- ❌ `DELETE /users/me` — banking apps do not allow self-deletion (compliance/data retention)

---

## Success Metrics

- ✅ All endpoints tested (0 runtime errors)
- ✅ All money operations atomic (MongoDB sessions)
- ✅ Audit trail complete (every action logged)
- ✅ Responsive design (375px - 1920px)
- ✅ Fast load times (< 3s first paint)
- ✅ Zero security vulnerabilities (validated inputs, role-based access)

---

## Business Model (Out of Scope)

Not building payment processing, subscription, or monetization yet. This is a proof-of-concept for:

- Technical architecture
- Feature completeness
- User experience
- Portfolio/demo value

---

---

**Last Updated:** May 29, 2026
