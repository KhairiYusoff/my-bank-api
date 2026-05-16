# Priority Board (May 2026)

**Last Updated:** May 15, 2026  
**Current Status:** All 4 repos deployed. P0 + P1 complete. Now on P2: codebase hardening.

---

## ✅ P0: Production Bugs — DONE

**my-bank-customer (Vercel)**

- [x] Bug: Transfer recipient (User B) bell icon not updating in real-time — fixed May 15
  - Root cause: `_sendTransferNotification` only called `sendNotification` for sender, never recipient

**my-bank-api (Render)**

- [x] No active P0 bugs

---

## ✅ P1: Deployment Blockers — DONE

**my-bank-admin-portal → Vercel** ✅ Live  
**notification-service → Railway/Render** ✅ Live

---

## 🟡 P2: Codebase Hardening (CURRENT SPRINT — Week of May 13–17)

> Goal: Fix all structural rot before adding new features. Find bad patterns, dead code, naming inconsistencies.

### Phase 2A — Dead Code & Redundancy (DO FIRST)

- [ ] **Delete** `src/shared/services/transactionService.js` — exact duplicate of `modules/transactions/transaction.service.js`
  - ⚠️ BLOCKER: `modules/transactions/transaction.controller.js` still imports the OLD shared version — must update import first
- [ ] **Delete** `src/shared/services/expenseService.js` — exact duplicate of `modules/expenses/expense.service.js`
  - ⚠️ BLOCKER: `modules/expenses/expense.controller.js` still imports the OLD shared version — must update import first
- [ ] **Delete** `src/shared/constants/expense.js` — exact copy of `modules/expenses/expense.constants.js`, zero imports anywhere (pure dead code)

### Phase 2B — Naming Inconsistencies

| Location             | Current (wrong)           | Target (correct)           |
| -------------------- | ------------------------- | -------------------------- |
| `shared/middleware/` | `authMiddleware.js`       | `auth.middleware.js`       |
| `shared/middleware/` | `accountMiddleware.js`    | `account.middleware.js`    |
| `shared/middleware/` | `activityMiddleware.js`   | `activity.middleware.js`   |
| `shared/middleware/` | `rateLimitMiddleware.js`  | `rate-limit.middleware.js` |
| `shared/middleware/` | `tokenMiddleware.js`      | `token.middleware.js`      |
| `shared/middleware/` | `userMiddleware.js`       | `user.middleware.js`       |
| `shared/middleware/` | `validationMiddleware.js` | `validation.middleware.js` |
| `shared/services/`   | `notificationService.js`  | `notification.service.js`  |
| `shared/services/`   | `websocketService.js`     | `websocket.service.js`     |
| `shared/utils/`      | `errorHandler.js`         | `error.handler.js`         |
| `shared/utils/`      | `validationHelpers.js`    | `validation.helpers.js`    |

> Models stay PascalCase (`Account.js`, `User.js`) — correct for Mongoose models/classes.

### Phase 2C — Fat Controllers (no service layer)

These controllers contain business logic — violates the route → controller → service pattern:

- [ ] `accounts/account.controller.js` — **526 lines**, no `account.service.js` exists
  - Extract: deposit, withdraw, transfer, balance logic into `account.service.js`
- [ ] `users/user.controller.js` — **348 lines**, no `user.service.js` exists
  - Extract: profile update, password change, KYC logic into `user.service.js`
- [ ] `admin/admin.controller.js` — **160 lines**, no `admin.service.js` exists
  - Extract: approve/reject/airdrop logic into `admin.service.js`

### Phase 2D — Duplicate Middleware

- [ ] Verify `modules/accounts/account.middleware.js` vs `shared/middleware/accountMiddleware.js` — consolidate to shared only
- [ ] Verify `modules/users/user.middleware.js` vs `shared/middleware/userMiddleware.js` — consolidate to shared only

---

**P2 Order:** 2A first (unblocks cleanest imports) → 2B → 2C → 2D  
**Backlog size:** ~15 items, estimated ~1.5 days total

---

## 🔵 P3: AI Features (BACKLOG)

**Status:** Code partially added, paused for deployment focus

### Current AI Work (Experimental)

- [ ] RAG setup in my-bank-api
- [ ] AI chatbot in my-bank-customer
- [ ] Knowledge base integration

**Decision:** Defer AI until both P1 & P2 complete (late May)  
**Reason:** Core banking stability > experimental features  
**Timeline:** See [ROADMAP.md](roadmap.md) for Phase 1-4 AI phases

---

## Weekly Check-In

| Week      | P0 Status | P1 Status | P2 Status  | P3 Status  | Notes                            |
| --------- | --------- | --------- | ---------- | ---------- | -------------------------------- |
| May 8-10  | [FIX]     | [DEPLOY]  | [QUEUE]    | [PAUSE]    | Focus: get admin + notif to prod |
| May 13-17 | [MONITOR] | [STABLE]  | [BUILD]    | [PAUSE]    | Focus: core banking bugs         |
| May 20-24 | [MONITOR] | [STABLE]  | [COMPLETE] | [EVALUATE] | Assess if ready for AI           |
| May 27-31 | [MONITOR] | [STABLE]  | [DONE]     | [START]    | Phase 1 AI begins                |

---

## Decision: Why AI is P3 (Not P2)

**You said:** "I got excited about RAG and started coding AI before finishing bugs"

**This is normal.** But here's why it should wait:

| Reason                              | Impact                                                               |
| ----------------------------------- | -------------------------------------------------------------------- |
| **2 repos not live yet**            | Users can't even LOG IN if admin-portal or notification-service fail |
| **2 repos already live need fixes** | Production debt builds if ignored                                    |
| **AI is experimental**              | Nice-to-have for portfolio, not core banking                         |
| **Bugs found by agent audit**       | These fix real problems, AI is speculative                           |

**Result:** Focus P1+P2, then evaluate AI readiness end of May.

---

## How to Handle AI Code Already Written

**Option A: Keep it, don't commit yet**

- Branch: `feature/ai-phase-1-rag`
- Work locally, merge after P1+P2 done
- Prevents shipping half-baked features

**Option B: Delete it, redo in June**

- Start fresh with clean design after you know what's broken
- Less technical debt
- Better documentation

**Recommendation:** Branch it, don't delete. Revisit June 1st.

---

## Next Action

1. **Fill in P0 items** (prod bugs from my-bank-customer, my-bank-api)
2. **Fill in P1 items** (what's blocking admin-portal and notification-service?)
3. **Fill in P2 items** (agent audit findings + core banking enhancements)
4. **Commit this board** with specific blockers
5. **Update weekly** every Friday

---

**Rule:** Don't touch P3 (AI) until P1+P2 are green.
