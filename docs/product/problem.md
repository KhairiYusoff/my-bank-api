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

**MyBank** — A full-stack banking platform with:

- **Customer Portal** (React, Vite) — Account management, transactions, watchlist, profile
- **Admin Portal** (React, Vite) — Application approval, user management, staff management, audit trails
- **Core API** (Node.js, Express) — All banking logic, modular architecture
- **Notification Service** (Node.js, Express) — Decoupled event notifications
- **AI Assistant** (Phase 1-4) — Chat Q&A, spend insights, agentic advisor, proactive nudges

---

## Scope (MVP — Current)

### Features ✅

| Feature                   | Scope                                                              | Status   |
| ------------------------- | ------------------------------------------------------------------ | -------- |
| **Auth**                  | Customer login, JWT tokens, httpOnly cookies                       | ✅ Built |
| **Onboarding**            | Digital application, KYC verification, profile completion          | ✅ Built |
| **Accounts**              | Create, view, balance, account types (Savings/Checking/Business)   | ✅ Built |
| **Transactions**          | Transfer between accounts, view history, pagination                | ✅ Built |
| **Deposits/Withdrawals**  | Banker deposits money, customer withdraws from own accounts        | ✅ Built |
| **Airdrop**               | Admin credits accounts (promotional/testing)                       | ✅ Built |
| **Expenses**              | Track and categorize user expenses                                 | ✅ Built |
| **Admin Functions**       | Approve applications, verify customers, manage users, manage staff | ✅ Built |
| **Audit Logging**         | All HIGH-severity actions logged (login, transfer, approval)       | ✅ Built |
| **Watchlist** (Customers) | Save/unsave accounts, persist via localStorage                     | ✅ Built |
| **Watchlist** (Admin)     | Manage flagged users, flagged transactions                         | ✅ Built |

### Out of Scope (MVP)

- ❌ Mobile app (web-first only)
- ❌ Credit scoring
- ❌ Loan products
- ❌ Investment products
- ❌ P2P transfers (only bank-initiated)
- ❌ Bill payments
- ❌ Cryptocurrency
- ❌ Comments / social features
- ❌ AI features (Phase 1 onwards)

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

## Next Phase (Phase 1 AI — May 2026)

Product Q&A chatbot powered by Groq LLM + markdown product docs (no vector DB yet). See [AI-ROADMAP](../AI-ROADMAP.md).

---

**Last Updated:** May 8, 2026
