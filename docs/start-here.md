# MyBank API — Start Here

**MyBank** is a full-stack Malaysian digital banking system. This repo is the core API (Node.js/Express, MongoDB). Two client apps consume it: `my-bank-customer` (React) and `my-bank-admin-portal` (React).

---

## New AI Agent? Read in this order.

Before touching any code or writing any story, read these files:

| # | File | Why |
| - | ---- | --- |
| 1 | [docs/project/tracker.md](project/tracker.md) | Current phase, what's done, what's next |
| 2 | [docs/product/business-rules.md](product/business-rules.md) | Account rules, limits, fees, lifecycle — the law |
| 3 | [docs/architecture/constraints.md](architecture/constraints.md) | Code patterns you must follow — non-negotiable |
| 4 | [docs/architecture/architecture.md](architecture/architecture.md) | Module structure, data flow |
| 5 | [docs/product/user-stories.md](product/user-stories.md) | All story IDs + status + links to detailed story files |
| 6 | Relevant story file in `docs/user-stories/phase-N/` | AC for the specific story you're building |

**Rule:** If a story file exists for the feature → read it fully before writing a single line of code. The AC in the story file is the definition of done.

---

## Quick Links

| Need | Go to |
| ---- | ----- |
| What are we building? | [product/problem.md](product/problem.md) |
| What phase is current? | [project/tracker.md](project/tracker.md) |
| Full phase roadmap | [project/roadmap.md](project/roadmap.md) |
| Business rules & limits | [product/business-rules.md](product/business-rules.md) |
| All user stories | [product/user-stories.md](product/user-stories.md) |
| Phase 5 stories | [user-stories/phase-5/](user-stories/phase-5/) |
| Code patterns (mandatory) | [architecture/constraints.md](architecture/constraints.md) |
| System design | [architecture/architecture.md](architecture/architecture.md) |
| DB schema | [engineering/models/schema-overview.md](engineering/models/schema-overview.md) |
| Auth flow | [engineering/security/authentication.md](engineering/security/authentication.md) |
| Role permissions | [engineering/security/authorization.md](engineering/security/authorization.md) |
| Tech choices | [architecture/tech-stack.md](architecture/tech-stack.md) |

---

## Repo Structure

```
src/
├── server.js              ← Entry point (port 5190)
├── config/                ← DB connection, env vars
├── modules/               ← Domain modules (one per feature)
│   ├── accounts/
│   ├── admin/
│   ├── ai/                ← Scaffolded, ON HOLD until Phase 11
│   ├── audit/
│   ├── auth/
│   ├── expenses/
│   ├── onboarding/
│   ├── transactions/
│   └── users/
└── shared/                ← Cross-cutting concerns
    ├── models/            ← All Mongoose models
    ├── middleware/        ← auth, roles, error handling
    ├── utils/             ← response helpers, formatters
    └── constants/

docs/
├── start-here.md          ← You are here
├── product/               ← Problem, business rules, user story index
├── user-stories/          ← Detailed stories with AC (Phase 5+ only)
│   └── phase-5/
├── architecture/          ← Constraints, architecture, tech stack
├── engineering/           ← Schema, auth, auth matrix, providers
└── project/               ← Roadmap, tracker
```

---

## Non-Negotiable Code Patterns

1. **Route → Controller → Service** — no exceptions. Business logic lives in the service only.
2. **All responses** use `success()` / `error()` from `shared/utils/response.js`
3. **All money operations** use MongoDB sessions (atomic, all-or-nothing)
4. **No cross-module model imports** — use shared models from `shared/models/`
5. **Audit log** every HIGH-severity action (login, transfer, deposit, approval)

Full rules → [architecture/constraints.md](architecture/constraints.md)

---

## Current Status

See [project/tracker.md](project/tracker.md) — always up to date.

**Phase 5 (Transaction Enrichment)** is next. Story written and ready:
- [US-5001](user-stories/phase-5/US-5001.md) — Transaction detail receipt (reference number, counterpart, balance after)

---

**Last Updated:** May 30, 2026
