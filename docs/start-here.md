# my-bank-api — Documentation Hub

Welcome! This is the complete documentation for the MyBank API backend — the core banking system.

---

## Quick Links

**New to the project?** Start here:

1. [PROBLEM](STRATEGIC/PROBLEM.md) — What problem does MyBank solve?
2. [ARCHITECTURE](ARCHITECTURE/ARCHITECTURE.md) — How is it built?
3. [REQUIREMENTS](STRATEGIC/REQUIREMENTS.md) — What features exist?
4. [CONSTRAINTS](ARCHITECTURE/CONSTRAINTS.md) — Rules you must follow

**Looking for something specific?**

- 🔗 **All API endpoints?** → [API CONTRACTS](API/CONTRACTS.md)
- 📊 **Database schema?** → [DATA MODELS](MODELS/SCHEMA-OVERVIEW.md)
- 🔐 **How auth works?** → [AUTHENTICATION](SECURITY/AUTHENTICATION.md)
- 👥 **Permissions matrix?** → [AUTHORIZATION](SECURITY/AUTHORIZATION.md)
- 🔌 **External services?** → [PROVIDERS](PROVIDERS.md)
- 🚀 **What's next?** → [ROADMAP](ROADMAP.md)
- 📈 **AI phases?** → [AI-ROADMAP](AI-ROADMAP.md)

---

## Project Structure

```
my-bank-api/
├── src/
│   ├── app/
│   ├── config/
│   ├── modules/           ← 8 domain modules
│   │   ├── accounts/
│   │   ├── admin/
│   │   ├── ai/            ← Phase 1-4
│   │   ├── audit/
│   │   ├── auth/
│   │   ├── expenses/
│   │   ├── onboarding/
│   │   ├── transactions/
│   │   └── users/
│   └── shared/            ← Cross-cutting concerns
│       ├── models/        ← 8 Mongoose models
│       ├── middleware/
│       ├── services/
│       ├── utils/
│       └── constants/
├── docs/                  ← You are here
├── package.json
├── .env.example
└── server.js
```

---

## Core Concepts

**Module Pattern:** Each domain (auth, accounts, transactions) has its own route → controller → service layer. No cross-module dependencies at model level.

**Shared Layer:** Models, middleware, services, utilities live in `shared/` and are imported by all modules.

**Atomic Transactions:** All money operations (deposit, withdraw, transfer, airdrop) use MongoDB sessions to ensure all-or-nothing writes.

**Audit Logging:** Every HIGH-severity action (login, transfer, approval, airdrop) is logged to ActivityLog for compliance.

**No Database:** Watchlist is localStorage-only in the client (my-bank-customer, my-bank-admin-portal).

---

## Modules at a Glance

| Module           | Purpose                                                      | Routes                                                           |
| ---------------- | ------------------------------------------------------------ | ---------------------------------------------------------------- |
| **auth**         | User login, registration, JWT                                | `/auth/login`, `/auth/register`, `/auth/check-token`             |
| **onboarding**   | Customer application workflow                                | `/onboarding/apply`, `/onboarding/verify`, `/onboarding/profile` |
| **accounts**     | Account CRUD, deposit, withdraw, airdrop                     | `/accounts/create`, `/accounts/deposit`, `/accounts/transfer`    |
| **transactions** | Transfer logic, transaction history                          | `/transactions/transfer`, `/transactions/history`                |
| **admin**        | Admin-only actions (approve apps, verify customers, airdrop) | `/admin/applications`, `/admin/approve`, `/admin/airdrop`        |
| **audit**        | Activity logs, compliance view                               | `/audit/logs`, `/audit/user-activity`                            |
| **expenses**     | Track and categorize expenses                                | `/expenses/create`, `/expenses/list`                             |
| **users**        | User profile, KYC, admin user management                     | `/users/profile`, `/users/kyc`                                   |
| **ai**           | AI chatbot, insights, agentic advisor (Phase 1-4)            | `/ai/ask`, `/ai/insights`                                        |

---

## Authentication

- **JWT tokens** stored in httpOnly cookies (secure by default)
- **No session database** — JWT is stateless
- **Role-based:** customer, banker, admin
- See [AUTHENTICATION](SECURITY/AUTHENTICATION.md) for flow

---

## Money Flow (Core Banking)

1. **Deposit** — Banker/customer adds money to account (1 transaction record + account balance update, atomic)
2. **Withdraw** — Customer removes money (same atomic pattern)
3. **Transfer** — Customer moves money A → B (2 transaction records, both atomic)
4. **Airdrop** — Admin adds money to any account (testing/promotional)

All operations create audit log entries. See [API CONTRACTS](API/CONTRACTS.md) for endpoints.

---

## File Navigation

```
📄 START-HERE.md (you are here)

📁 STRATEGIC/
  ├─ PROBLEM.md           Why MyBank exists
  ├─ REQUIREMENTS.md      What's been built
  └─ USER-STORIES.md      [BLANK] Future AI features

📁 ARCHITECTURE/
  ├─ ARCHITECTURE.md      Data flow, module tree
  ├─ TECH-STACK.md        Why each tool
  └─ CONSTRAINTS.md       Rules you must follow

📁 API/
  └─ CONTRACTS.md         All 8 endpoints

📁 MODELS/
  └─ SCHEMA-OVERVIEW.md   All 8 models + relationships

📁 SECURITY/
  ├─ AUTHENTICATION.md    JWT + httpOnly flow
  └─ AUTHORIZATION.md     RBAC matrix

📁 technical/
  ├─ MENTAL-MODELS.md     Concepts (notifications, fraud, audit)
  ├─ NODEJS-PRACTICES.md  [BLANK]
  ├─ MONGODB-PRACTICES.md [BLANK]
  └─ ZOD-PRACTICES.md     [BLANK]

📄 PROVIDERS.md           notification-service webhook + future Groq/Cohere
📄 ROADMAP.md             Timeline + phases
📄 TRACKER.md             Daily progress
📄 RESEARCH.md            Decisions + learnings
📄 AI-ROADMAP.md          Phase 1-4 AI evolution
📄 MENTAL-MODELS.md       Banking concepts
```

---

## Key Decisions

| Decision                 | Why                                                          |
| ------------------------ | ------------------------------------------------------------ |
| **MongoDB** over SQL     | Flexible schema, Atlas free tier, good for startup           |
| **Express.js**           | Lightweight, modular, good for microservices later           |
| **Modular architecture** | Each domain independent, easy to extract to separate service |
| **Atomic transactions**  | Money operations must be all-or-nothing                      |
| **Audit logging**        | Regulatory compliance + debugging                            |
| **No auth database**     | JWT stateless = faster, no session table                     |
| **notification-service** | Decoupled, can run separately, reusable                      |

---

## Getting Started (Developer)

1. Clone repo
2. `npm install`
3. Create `.env.local` with `MONGODB_URI`, `JWT_SECRET`
4. `npm run dev` — server starts on port 5000
5. See [CONSTRAINTS](ARCHITECTURE/CONSTRAINTS.md) for code patterns

---

## Next Steps

- **Phase 1 AI (May 2026):** Chat widget for product Q&A ([AI-ROADMAP](AI-ROADMAP.md))
- **Phase 2 AI (June 2026):** Spend insights with embeddings
- **Phase 3 AI (July 2026):** Agentic advisor with tools
- **Phase 4 AI (August 2026):** Proactive nudges

---

**Last Updated:** May 8, 2026  
**Maintainer:** Solo dev (you)  
**Questions?** Refer to [RESEARCH.md](RESEARCH.md) for decision context.
