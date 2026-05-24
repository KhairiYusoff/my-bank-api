# Tracker

**Last Updated:** May 22, 2026
**Current Phase:** Phase 2 — Architecture Completion

See [roadmap.md](roadmap.md) for full project history and phase descriptions.

---

## Now — Phase 2 Architecture Gaps

| #   | Task                                                                                                    | Status  |
| --- | ------------------------------------------------------------------------------------------------------- | ------- |
| 2A  | Create `auth.service.js` — extract login, logout, refreshToken out of controller                        | ⬜ TODO |
| 2B  | Expand `onboarding.service.js` — extract apply, completeProfile, verifyCustomer, getPendingApplications | ⬜ TODO |
| 2C  | Expand `audit.service.js` — extract getOwnActivity, getUserActivity, getAllActivities read logic        | ⬜ TODO |
| 2D  | Replace all 6 local `handleError` copies with shared `error()` utility                                  | ⬜ TODO |

---

## Completed

### Phase 1 — Codebase Hardening (May 13–19, 2026) ✅

All 1A–1E tasks done. See roadmap.md for detail.

### Phase 0 — Foundation & Deployment (May 8–10, 2026) ✅

All services deployed. P0 bugs fixed. See roadmap.md for detail.

---

## Notes

- 2D (handleError) is a quick sweep — good warm-up before the service extractions
- Phase 3 (AI) is blocked on Phase 2 being fully closed
- `notifications` module has no service layer but it's a thin proxy — low priority, not blocking
