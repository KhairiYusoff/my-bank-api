# my-bank-api — Documentation Hub

Welcome! This is the complete documentation for the MyBank API backend — the core banking system.

---

## Quick Links

**New to the project?** Start here:

1. [PROBLEM](product/problem.md) — What problem does MyBank solve?
2. [ARCHITECTURE](architecture/architecture.md) — How is it built?
3. [REQUIREMENTS](product/requirements.md) — What features exist?
4. [CONSTRAINTS](architecture/constraints.md) — Code patterns & rules

**Looking for something specific?**

- 📊 **Database schema?** → [DATA MODELS](engineering/models/schema-overview.md)
- 🔐 **How auth works?** → [AUTHENTICATION](engineering/security/authentication.md)
- 👥 **Permissions matrix?** → [AUTHORIZATION](engineering/security/authorization.md)
- 🚀 **Tech stack & why?** → [TECH-STACK](architecture/tech-stack.md)
- 📈 **Progress tracking?** → [TRACKER](project/tracker.md)
- 🗺️ **What's next?** → [ROADMAP](project/roadmap.md)

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
- See [AUTHENTICATION](engineering/security/authentication.md) for flow

---

## Money Flow (Core Banking)

1. **Deposit** — Banker/customer adds money to account (1 transaction record + account balance update, atomic)
2. **Withdraw** — Customer removes money (same atomic pattern)
3. **Transfer** — Customer moves money A → B (2 transaction records, both atomic)
4. **Airdrop** — Admin adds money to any account (testing/promotional)

All operations create audit log entries. See [ARCHITECTURE](architecture/architecture.md) for data flow details and [DATA MODELS](engineering/models/schema-overview.md) for schema.

---

## File Navigation

```
📄 START-HERE.md (you are here)

📁 architecture/
  ├─ architecture.md      System design, data flow, module tree
  ├─ constraints.md       Mandatory patterns and rules
  └─ tech-stack.md        Why each tool & version

📁 product/
  ├─ problem.md           Why MyBank exists, market problem
  ├─ requirements.md      Feature acceptance criteria
  └─ user-stories.md      [BLANK] Future AI features (Phase 1-4)

📁 engineering/
  ├─ models/
  │   └─ schema-overview.md   All 8 Mongoose models + relationships
  ├─ security/
  │   ├─ authentication.md    JWT + httpOnly cookie flow
  │   └─ authorization.md     RBAC matrix per role
  └─ providers/
      └─ ai/
          ├─ groq.md               Groq LLM docs
          ├─ cohere.md             Cohere embeddings docs
          ├─ langchain.md          LangChain.js research
          ├─ vercel-ai-sdk.md      Vercel AI SDK research
          └─ atlas-vector-search.md MongoDB Atlas Vector docs

📁 project/
  ├─ roadmap.md           MVP timeline + Phase 1-4 evolution
  └─ tracker.md           Daily progress & next steps
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
5. See [CONSTRAINTS](architecture/constraints.md) for code patterns

---

## Next Steps

- **Phase 1 AI (May 2026):** Chat widget for product Q&A
- **Phase 2 AI (June 2026):** Spend insights with embeddings
- **Phase 3 AI (July 2026):** Agentic advisor with tools
- **Phase 4 AI (August 2026):** Proactive nudges

See [ROADMAP](project/roadmap.md) for timeline details.

---

**Last Updated:** May 8, 2026  
**Maintainer:** Solo dev (you)  
**Questions?** Check the relevant doc or refer to [TRACKER](project/tracker.md) for recent decisions.
