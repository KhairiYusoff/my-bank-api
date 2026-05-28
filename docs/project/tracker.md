# Tracker

**Last Updated:** May 25, 2026
**Current Phase:** Phase 3 — AI Features

See [roadmap.md](roadmap.md) for full project history and phase descriptions.

---

## Now — Phase 3 AI Features

| #   | Task                                                      | Status  |
| --- | --------------------------------------------------------- | ------- |
| 3A  | RAG setup — knowledge base integration in my-bank-api     | ⬜ TODO |
| 3B  | AI chatbot UI — my-bank-customer                          | ⬜ TODO |
| 3C  | Financial insights — spending breakdown with AI narrative | ⬜ TODO |

---

## Completed

### Phase 2 — Architecture Completion (May 25, 2026) ✅

| #   | Task                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 2D  | Replaced all 6 local `handleError` copies with shared `error()` utility                                     |
| 2A  | Created `auth.service.js` — extracted login, logout, refreshToken                                           |
| 2B  | Expanded `onboarding.service.js` — extracted apply, completeProfile, verifyCustomer, getPendingApplications |
| 2C  | Expanded `audit.service.js` — extracted 3 read functions with shared `_queryLogs` builder                   |

### Phase 1 — Codebase Hardening (May 13–19, 2026) ✅

All 1A–1E tasks done. See roadmap.md for detail.

### Phase 0 — Foundation & Deployment (May 8–10, 2026) ✅

All services deployed. P0 bugs fixed. See roadmap.md for detail.

---

## Notes

- AI scaffolding already exists: `ai.controller.js`, `ai.service.js`, `ai.guardrails.js`, `ai.tools.js`
- `notifications` module has no service layer — thin proxy, low priority, not blocking P3

---

## Performance Optimization Backlog

Items identified during architecture audit (May 28, 2026). Not blocking any current phase.

| #   | Item                                                                                                                          | Impact | Status  |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| P1  | `authorizeRoles` fires a redundant `User.findById` on every protected request — `req.user` is already set by `authMiddleware` | Medium | ⬜ TODO |
| P2  | Route auto-loader — `server.js` manually imports every route module; a dynamic loader would scale better at 20+ modules       | Low    | ⬜ TODO |
