# MyBank — Problem & Product Brief

---

## Problem

**Background:** Traditional banking is fragmented across web, mobile, and offline channels. For young professionals and students in Malaysia, there is no unified, transparent banking platform that combines:

- Account management (savings, checking, business, fixed deposits)
- Transaction tracking
- Expense categorization and spending analytics
- Onboarding verification (digital KYC)
- Admin/banker controls and operations

**Target Audience:** Young professionals, students, and self-employed individuals who want digital-first banking without administrative complexity.

**Why Now:** The tech stack exists (MongoDB, Node.js, React), and there is strong demand for seamless, transparent fintech solutions in Malaysia due to growing digital adoption.

---

## What We're Building

**MyBank** is a full-stack Malaysian digital banking simulation, built to real-world banking standards:

- **Customer Portal** (React, Vite) — Multi-account management, transfers, transaction receipts, statement history, beneficiaries, expense tracking, and AI financial assistant.
- **Admin Portal** (React, Vite) — Account request approvals, user/staff management, status modifications, audit trails, and transaction oversight.
- **Core API** (Node.js, Express) — Banking business logic: account types with differentiated rules, transaction limits, fee engines, interest crediting, dormancy lifecycles, and atomic database operations.
- **Notification Service** (Node.js, Express) — Decoupled event notifications via WebSocket.

---

## Product Scope (Functional Capabilities)

### Core Features

- **Authentication & RBAC:** Secure login with JWT tokens via HTTP-only cookies, with role-based access control supporting 4 distinct roles (`admin`, `banker`, `auditor`, `customer`).
- **Digital Onboarding & KYC:** Customer digital application, banker review/approval, and initial Savings account provisioning.
- **Multi-Account Management:** Support for Savings, Current, Business, and Fixed Deposit accounts with standardized currency formatting (`RM X,XXX.XX`).
- **Enriched Transactions:** Account transfers, deposits, and withdrawals, capturing comprehensive audit data (references, counterparts, channel, device info, and running balance).
- **Automated Lifecycle & Fees:** Cron-based dormancy scanning (after 12 months of inactivity), annual dormancy fees, savings interest crediting, and monthly maintenance fees.
- **Administrative Controls:** Banker-initiated account suspension/reactivation and managed closure workflows (with early closure penalty checks).
- **Expense Analytics:** On-demand expense logging, categorization, and monthly/yearly spending breakdowns.
- **Notification Engine:** Real-time WebSocket notifications and automated alerts for transactional and lifecycle events.
- **AI Financial Assistant:** Contextual, data-aware chat helping customers with analytics and transaction inquiries.

### Intentionally Out of Scope

- ❌ Mobile app (web-responsive only)
- ❌ Interbank transfers (FPX, IBG, DuitNow) — same-bank simulation only
- ❌ Real third-party KYC verification (Jumio etc.)
- ❌ Real payment gateway integrations (Stripe, Razorpay)
- ❌ Credit scoring, loans, or investment products (Unit Trusts, ASB)
- ❌ 2FA (Two-Factor Authentication)
- ❌ Customer self-deletion of accounts (`DELETE /users/me` blocked for compliance and data retention rules)

---

## Success Metrics

- **Zero Runtime Failures:** Fully validated API inputs and error boundaries.
- **Data Integrity:** All money transactions executed atomically via Mongoose sessions (all-or-nothing).
- **Comprehensive Audit Trail:** Every high-severity administrative and financial action captured in `ActivityLog`.
- **Aesthetic Excellence:** Premium, modern, responsive interfaces (375px to 1920px width).
- **Performance:** Fast initial page loads (< 3s first paint) and optimized API response times.

---

## Business Model & POC Purpose

MyBank does not implement actual payment processing or monetization strategies. It serves as a simulation and proof-of-concept demonstrating:

- Clean, production-grade Node.js/React architecture
- Banking compliance and RBAC implementation
- Smooth, aesthetic financial user experiences
