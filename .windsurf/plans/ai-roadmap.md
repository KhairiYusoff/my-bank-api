# AI Evolution Roadmap — MyBank Platform

**Last updated:** 2026-04-25
**Principle:** ADD intelligence, never migrate. Existing 4 repos untouched at core.
**AI lives in:** `my-bank-api/src/modules/ai/` (extract to separate service only if pain justifies it)

---

## Final Tech Stack (Approved)

| Layer         | Tool                                                                         | Tier                     | Notes                               |
| ------------- | ---------------------------------------------------------------------------- | ------------------------ | ----------------------------------- |
| LLM           | Groq (Llama 3.3-70b)                                                         | Free (14,400 req/day)    | Swap to OpenAI GPT-4o when scaling  |
| Embeddings    | Cohere `embed-english-light-v3.0`                                            | Free (1,000 calls/month) | Phase 2+                            |
| Vector DB     | MongoDB Atlas Vector Search                                                  | Free (M0)                | Already have Mongo, no new service  |
| Backend       | Vercel AI SDK `tools` param (Phase 3) → LangGraph.js (Phase 5 — new service) | Open source              | Graduate complexity per phase       |
| Frontend chat | Vercel AI SDK `useChat` hook                                                 | Open source              | Handles streaming, history, loading |
| Chat state    | Vercel AI SDK state                                                          | —                        | NOT RTK Query — wrong tool for chat |
| PII masking   | Custom middleware                                                            | Free                     | Runs before any data touches LLM    |
| Scheduler     | node-cron                                                                    | Open source              | Phase 4 proactive nudges            |
| Audit log     | MongoDB (existing)                                                           | Free                     | AiAuditLog model                    |

---

## File Structure (inside my-bank-api)

```
src/modules/ai/
  ai.routes.js          # API endpoints
  ai.controller.js      # Request/response handling
  ai.service.js         # LLM calls, RAG pipeline
  ai.tools.js           # Agent tools (Phase 2+)
  ai.guardrails.js      # PII masking (Phase 2+)
  ai.agent.js           # LangGraph ReAct agent (Phase 3)
  ai.scheduler.js       # node-cron proactive scoring (Phase 4)

src/shared/
  models/
    AiAuditLog.js       # Audit trail (Phase 3)
  docs/                 # Static product docs for Phase 1 RAG
    product-savings.md
    product-fd.md
    product-current.md
```

---

## Phase 1 — Product Q&A

**Status:** COMPLETE ✅ | Committed: April 22 2026

### What changes

| Repo                   | Changes                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `my-bank-api`          | `modules/ai/` — `POST /api/ai/ask`, context stuffing (no vector DB yet) |
| `my-bank-customer`     | `features/assistant/components/ChatWidget.tsx` using `useChat`          |
| `my-bank-admin-portal` | Nothing                                                                 |
| `notification-service` | Nothing                                                                 |

### How it works

```
User question + [all product .md files as context] → Groq → Streamed answer
```

### API Contract

```
POST /api/ai/ask
Body: { message: string, conversationId?: string }
Auth: requireAuth middleware
Response: streamed text (SSE)
```

---

## Phase 2 — Personal Spend Insights

**Status:** COMPLETE ✅ | Committed: April 23 2026

### Commits (my-bank-api)

| Hash      | Description                                              |
| --------- | -------------------------------------------------------- |
| `11f8f64` | feat(ai): add PII masking guardrails and spend data tool |
| `94c4ab5` | feat(ai): add GET /api/ai/insights endpoint              |
| `d51c0f1` | feat(ai): inject spend context into chat system prompt   |

### Commits (my-bank-customer)

| Hash      | Description                                                  |
| --------- | ------------------------------------------------------------ |
| `e78a94f` | feat(ai): Phase 2 - SpendInsightsCard component and AI store |
| `efb026f` | feat(dashboard): wire SpendInsightsCard into dashboard page  |

### What changed

| Repo               | Files                                                                                                                                                                                                           |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `my-bank-api`      | `ai.guardrails.js`, `ai.tools.js`, `ai.service.js`, `ai.controller.js`, `ai.routes.js`, `ai.yaml`                                                                                                               |
| `my-bank-customer` | `features/ai/types/ai.ts`, `features/ai/store/aiApi.ts`, `features/ai/constants/insights.ts`, `features/ai/components/SpendInsightsCard/`, `app/store/baseApi.ts`, `features/dashboard/pages/DashboardPage.tsx` |

### PII Masking — SHIPPED

Fields masked before any data reaches Groq:

- `name` → `[USER]`, `email` → `[EMAIL]`, `identityNumber` → `[IC]`, `accountNumber` → stripped entirely, `phoneNumber` → `[PHONE]`
- `maskUserForLLM()` — strips user PII for system prompt
- `maskSpendingDataForLLM()` — removes account numbers, keeps aggregate totals only

### API Contract (actual)

```
GET /api/ai/insights?period=week|month|quarter|year
Auth: cookie JWT (authMiddleware)
Rate: aiRateLimit (20 req/min)
Response: { success, data: { period, since, totalSpent, topCategories[], accounts[], aiNarrative } }
```

### Key implementation notes

- `getSpendingBreakdown(userId, period)` — MongoDB aggregation on `Expense` collection, groups by category, returns top 5
- `generateInsightsText(maskedData)` — uses `generateText()` (one-shot, not streaming)
- `streamChatResponse` now fetches spend context per request and injects into `buildSystemPrompt()` — chat can answer "how much did I spend on food?" accurately
- Chat spend context fetch is non-critical — failure is caught + warned, chat continues without it

---

## Phase 3 — Agentic Advisor

**Status:** COMPLETE ✅ | Committed: April 25 2026

### Commits (my-bank-api)

| Hash      | Description                                                                |
| --------- | -------------------------------------------------------------------------- |
| `9bc4e7f` | feat(ai): add AiAuditLog model for Phase 3 audit trail                     |
| `ff43405` | feat(ai): Phase 3 - extend tools with full model coverage                  |
| `9bd0f36` | feat(ai): Phase 3 - add mask functions for transactions, profile, activity |
| `dca50c4` | feat(ai): Phase 3 - wire 5 tools into streamText with Zod schemas          |

### Architecture decision

Use **Vercel AI SDK built-in `tools` parameter** (already installed, Node 16 compatible) — NOT LangGraph.
LangGraph is reserved for Phase 5 as a standalone service when complexity justifies a full graph.
See Decision Log for rationale.

### What changes

| Repo                   | Changes                                                                       |
| ---------------------- | ----------------------------------------------------------------------------- |
| `my-bank-api`          | `ai.tools.js` (5 new tools), `ai.service.js` (wire tools), `AiAuditLog` model |
| `my-bank-customer`     | Nothing — ChatWidget already works, tool calls are invisible to frontend      |
| `my-bank-admin-portal` | Nothing in Phase 3                                                            |
| `notification-service` | Nothing                                                                       |

### Agent Tools (ALL scoped to req.user.\_id)

```javascript
// New in Phase 3
getTransactionHistory(userId, { type?, from?, to?, limit? })  // Transaction model
getAccountSummary(userId)                                      // Account model (no account numbers)
getUserProfile(userId)                                         // User model (no PII fields)
getActivitySummary(userId, { action?, from?, to?, limit? })    // ActivityLog model

// Upgraded in Phase 3
getSpendingBreakdown(userId, period)  // + topExpenseDescription per category (fixes zakat guessing)

// Removed (replaced by real data)
// classifyTransaction — no longer needed, AI reads actual descriptions
// getBankProductInfo — already handled by product docs in system prompt
```

### Tool data coverage — what the AI will know

| Question                             | Tool used                                                                          |
| ------------------------------------ | ---------------------------------------------------------------------------------- |
| When was my last transfer? How much? | `getTransactionHistory({ type:'transfer', limit:1 })`                              |
| Total withdrawals in Jan 2025?       | `getTransactionHistory({ type:'withdrawal', from:'2025-01-01', to:'2025-01-31' })` |
| Which account has highest balance?   | `getAccountSummary`                                                                |
| My biggest expense this month?       | `getSpendingBreakdown` (now includes description)                                  |
| When did I last login?               | `getActivitySummary({ action:'LOGIN', limit:1 })`                                  |
| Did my last deposit go through?      | `getActivitySummary({ action:'DEPOSIT', limit:1 })`                                |
| Personalised saving advice           | `getSpendingBreakdown` + `getTransactionHistory` combined                          |
| What is my account status?           | `getUserProfile`                                                                   |

### ⚠️ `getSpendingBreakdown` fix (Phase 3)

Phase 2 groups by `category` only — LLM guesses wrong context (e.g. `personal` → assumed rent, actually `"Zakat fitrah 2024"`).
`description` is **always required** on Expense — use `$push`+`$first` to pull it per category:

```js
// Phase 3 output
{ category: "personal", total: 2800, pct: 70.5, topExpenseDescription: "Zakat fitrah 2024" }
```

Note: description is free text — must go through PII masking before reaching Groq.

### How tool calling works (ai SDK)

```
User: "when was my last transfer?"
  │
  ▼
streamText({ tools: { getTransactionHistory, ... }, maxSteps: 3 })
  │
  ▼  [LLM decides tool needed]
getTransactionHistory({ type: 'transfer', limit: 1 })
  → queries Transaction model → masked → returned to LLM
  │
  ▼  [LLM composes answer]
"Your last transfer was on April 10, 2026 for $500."
  │
  ▼
Streamed back to ChatWidget
```

### New model: `AiAuditLog`

```js
{
  (userId, tool, inputSummary, timestamp);
} // no raw PII stored
```

Non-blocking — logged inside each tool `execute` function.

### Security (non-negotiable)

- Every tool's `execute` receives `userId` from `req.user._id` — never from client input
- `getUserProfile` strips: name, email, phoneNumber, identityNumber, password, refreshToken
- `getActivitySummary` strips: IP addresses if stored
- Every tool call logged to `AiAuditLog`
- Disclaimer in system prompt: "Always end financial advice responses with: This is not financial advice."
- `maxSteps: 3` — hard cap on agentic loops

---

## Phase 5 — LangGraph Agentic Service (Future)

**Status:** NOT STARTED | Complexity: VERY HIGH | Separate service

Once Phase 3 proves the agent concept works, rebuild as a dedicated `ai-service` repo using LangGraph.js.

- Full graph control: explicit nodes, conditional edges, persistent memory
- Human-in-the-loop approval for high-risk actions
- Multi-agent orchestration (e.g. budget agent + product recommendation agent)
- This is where you learn and build LangGraph properly

---

## Phase 4 — Proactive Nudges

**Status:** NOT STARTED | Complexity: MEDIUM | Timeline: ~1-2 weeks

### What changes

| Repo                   | Changes                                                                 |
| ---------------------- | ----------------------------------------------------------------------- |
| `my-bank-api`          | `ai.scheduler.js` — node-cron daily scoring → call notification-service |
| `notification-service` | Add `ai_nudge` trigger type                                             |
| `my-bank-customer`     | Nothing (uses existing notification UI)                                 |
| `my-bank-admin-portal` | Predictive risk flags on user list                                      |

---

## Guardrails (ALL phases)

1. PII masking before any user data touches LLM (Phase 2+)
2. All tools scoped to authenticated user's ID
3. Every AI query logged to AiAuditLog (Phase 3+)
4. Disclaimer: "This is not financial advice." on all financial AI responses
5. No stack traces to client
6. `/api/ai/*` rate-limited separately from banking routes

---

## Free Tier Limits

| Tool              | Limit             | Action when hit             |
| ----------------- | ----------------- | --------------------------- |
| Groq              | 14,400 req/day    | Upgrade to OpenAI GPT-4o    |
| Cohere embeddings | 1,000 calls/month | Switch to OpenAI embeddings |
| MongoDB M0        | 512MB             | Upgrade to M2 ($9/month)    |

---

## Decision Log

| Date       | Decision                                                 | Reason                                                                                                                             |
| ---------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| 2026-04-21 | AI in `my-bank-api/modules/ai/` not separate service     | Solo dev, simplicity first                                                                                                         |
| 2026-04-21 | Groq over OpenAI                                         | Free tier, same API format                                                                                                         |
| 2026-04-21 | Atlas Vector Search over Pinecone                        | Already have MongoDB                                                                                                               |
| 2026-04-21 | Vercel AI SDK for chat UI                                | `useChat` > custom RTK Query for chat                                                                                              |
| 2026-04-21 | LangGraph for Phase 3 only                               | Overkill for Phase 1-2                                                                                                             |
| 2026-04-25 | Switch Phase 3 from LangGraph to ai SDK built-in tools   | LangGraph is ESM-only — high Node 16 risk; ai SDK already installed and proven. LangGraph moved to Phase 5 as a standalone service |
| 2026-04-25 | Add getUserProfile + getActivitySummary to Phase 3 tools | All 5 models (User, Account, Transaction, Expense, ActivityLog) needed for truly smart agent                                       |
