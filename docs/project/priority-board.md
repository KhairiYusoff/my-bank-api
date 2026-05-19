# Priority Board (May 2026)

**Last Updated:** May 19, 2026  
**Current Status:** P0 + P1 + P2 (A–E) fully complete. Ready for P3.

---

## ✅ P0: Production Bugs — DONE

- [x] Transfer recipient (User B) bell icon not updating in real-time — fixed May 15
  - Root cause: `_sendTransferNotification` only notified sender, not recipient

---

## ✅ P1: Deployment Blockers — DONE

- [x] my-bank-admin-portal → Vercel ✅ Live
- [x] notification-service → Railway/Render ✅ Live

---

## ✅ P2: Codebase Hardening — DONE (May 15–18)

### ✅ 2A — Dead Code Removed (May 15)

- [x] Deleted `shared/services/transactionService.js` (duplicate)
- [x] Deleted `shared/services/expenseService.js` (duplicate)
- [x] Deleted `shared/constants/expense.js` (dead, zero imports)
- [x] Rewired `transaction.controller` + `expense.controller` to their local module services

### ✅ 2B — Naming Standardised (May 15)

- [x] 11 files renamed in `shared/middleware/`, `shared/services/`, `shared/utils/` to `dot.notation`
- [x] 19 import paths updated across all modules + `server.js`

### ✅ 2D — Duplicate Middleware Eliminated (May 15)

- [x] Deleted `modules/accounts/account.middleware.js` (identical to shared)
- [x] Deleted `modules/users/user.middleware.js` (identical to shared)

### ✅ 2C — Fat Controllers Extracted (May 18)

- [x] `account.service.js` created — `account.controller.js`: 526 → 149 lines
- [x] `user.service.js` created — `user.controller.js`: 348 → 113 lines
- [x] `admin.service.js` created — `admin.controller.js`: 160 → 67 lines
- [x] All 3 controllers now HTTP-only: extract params → call service → respond

---

## ✅ P2E: Final Consistency Audit — DONE (May 19)

**Goal:** Every module uses identical patterns — `handleError`, `success()/error()` utils, `exports.fn` style, fat-free controllers.

### Error handling — `handleError` + service `statusCode`

- [x] `transaction.controller.js` — add `handleError`, replace 4× inline `res.status(500).json`
- [x] `transaction.service.js` — set `err.statusCode` on thrown errors; add `getAllTransactions()`
- [x] `auth.controller.js` — add `handleError`, replace 3× inline `res.status(500).json`
- [x] `expense.controller.js` — add `handleError`, replace hardcoded `statusCode: 500` catch blocks
- [x] `expense.service.js` — set `err.statusCode` on 404-class errors ("not found" / "access denied")

### Response format — `success()/error()` utilities everywhere

- [x] `admin.controller.js` — replace 4× `res.json({ msg })` with `success(res, { message, data })`
- [x] `onboarding.controller.js` — replace `res.json({ msg })` / `res.status(x).json({ msg })` in `approveApplication`, `verifyCustomer`, `getPendingApplications`

### Export pattern — `exports.fn` not `module.exports = {}`

- [x] `ai.controller.js` — convert `module.exports = { chat, getInsights }` to `exports.chat` / `exports.getInsights`

### Fat controller

- [x] `transaction.controller.js` — extract `getAllTransactions` DB logic to `transaction.service.js`

---

## 👉 WHAT TO DO RIGHT NOW

Start P3 — AI features. Codebase is fully clean.

---

## 🔵 P3: AI Features (NEXT)

**Status:** Code partially written, on hold since May 8. Ready to evaluate.

- [ ] RAG setup in my-bank-api
- [ ] AI chatbot in my-bank-customer
- [ ] Knowledge base integration

**Gate:** P2 structural audit ✅ done. P2C is optional before P3.  
**Start:** Week of May 20 if you skip 2C, or May 27 if you do 2C first.

---

## Weekly Check-In

| Week      | P0 Status  | P1 Status   | P2 Status     | P3 Status | Notes                     |
| --------- | ---------- | ----------- | ------------- | --------- | ------------------------- |
| May 8–10  | ✅ Fixed   | ✅ Deployed | Queued        | Paused    | Deployed admin + notif    |
| May 13–17 | ✅ Monitor | ✅ Stable   | 2A+2B+2D done | Paused    | Structural audit complete |
| May 18    | ✅ Monitor | ✅ Stable   | 2C done       | —         | Fat controllers extracted |
| May 19    | ✅ Monitor | ✅ Stable   | 2E done       | —         | **YOU ARE HERE**          |
| May 20–24 | Monitor    | Stable      | 2E done       | Evaluate  | Start P3 eval             |
| May 27–31 | Monitor    | Stable      | Done          | Start     | Phase 1 AI begins         |

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
