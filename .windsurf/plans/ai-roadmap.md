# AI Evolution Roadmap — MyBank Platform

**Last updated:** 2026-04-21
**Principle:** ADD intelligence, never migrate. Existing 4 repos untouched at core.
**AI lives in:** `my-bank-api/src/modules/ai/` (extract to separate service only if pain justifies it)

---

## Final Tech Stack (Approved)

| Layer | Tool | Tier | Notes |
|---|---|---|---|
| LLM | Groq (Llama 3.3-70b) | Free (14,400 req/day) | Swap to OpenAI GPT-4o when scaling |
| Embeddings | Cohere `embed-english-light-v3.0` | Free (1,000 calls/month) | Phase 2+ |
| Vector DB | MongoDB Atlas Vector Search | Free (M0) | Already have Mongo, no new service |
| Backend | LangChain.js (Phase 1–2) → LangGraph.js (Phase 3) | Open source | Graduate complexity per phase |
| Frontend chat | Vercel AI SDK `useChat` hook | Open source | Handles streaming, history, loading |
| Chat state | Vercel AI SDK state | — | NOT RTK Query — wrong tool for chat |
| PII masking | Custom middleware | Free | Runs before any data touches LLM |
| Scheduler | node-cron | Open source | Phase 4 proactive nudges |
| Audit log | MongoDB (existing) | Free | AiAuditLog model |

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
**Status:** NOT STARTED | Complexity: LOW (~150 lines) | Timeline: ~3-5 days

### What changes
| Repo | Changes |
|---|---|
| `my-bank-api` | `modules/ai/` — `POST /api/ai/ask`, context stuffing (no vector DB yet) |
| `my-bank-customer` | `features/assistant/components/ChatWidget.tsx` using `useChat` |
| `my-bank-admin-portal` | Nothing |
| `notification-service` | Nothing |

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
**Status:** NOT STARTED | Complexity: MEDIUM | Timeline: ~1-2 weeks

### What changes
| Repo | Changes |
|---|---|
| `my-bank-api` | `ai.tools.js`, `ai.guardrails.js`, `POST /api/ai/insights` |
| `my-bank-customer` | `SpendInsightsCard.tsx` on DashboardPage |
| `my-bank-admin-portal` | Nothing |
| `notification-service` | Nothing |

### PII Masking (mandatory before Phase 2 ships)
Fields: `name` → `[USER]`, `identityNumber` → `[IC]`, `accountNumber` → `[ACC]`, `phoneNumber` → `[PHONE]`, `email` → `[EMAIL]`

### Atlas Vector Search setup
- Collection: `ai_embeddings`
- Index: `embedding` field (1024 dimensions for Cohere)
- User scoping: `userId` field on every document

### API Contract
```
POST /api/ai/insights
Body: { period?: 'month' | 'quarter' }
Auth: requireAuth
Response: { summary: string, topCategories: [], aiNarrative: string }
```

---

## Phase 3 — Agentic Advisor
**Status:** NOT STARTED | Complexity: HIGH | Timeline: ~3-4 weeks

### What changes
| Repo | Changes |
|---|---|
| `my-bank-api` | `ai.agent.js` (LangGraph), `AiAuditLog` model, SSE endpoint |
| `my-bank-customer` | `features/assistant/pages/AssistantPage.tsx` |
| `my-bank-admin-portal` | `features/insights/pages/InsightsPage.tsx` — anomaly flags |
| `notification-service` | Nothing |

### Agent Tools (ALL scoped to req.user.id)
```javascript
getAccountSummary(userId)
getSpendingBreakdown(userId, period)
getTransactionHistory(userId, filters)
classifyTransaction(description)
getBankProductInfo(productType)
```

### Security (non-negotiable)
- Every tool call verifies `tool.userId === req.user.id`
- Every query logged to `AiAuditLog`
- Disclaimer on all responses: "This is not financial advice."

---

## Phase 4 — Proactive Nudges
**Status:** NOT STARTED | Complexity: MEDIUM | Timeline: ~1-2 weeks

### What changes
| Repo | Changes |
|---|---|
| `my-bank-api` | `ai.scheduler.js` — node-cron daily scoring → call notification-service |
| `notification-service` | Add `ai_nudge` trigger type |
| `my-bank-customer` | Nothing (uses existing notification UI) |
| `my-bank-admin-portal` | Predictive risk flags on user list |

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

| Tool | Limit | Action when hit |
|---|---|---|
| Groq | 14,400 req/day | Upgrade to OpenAI GPT-4o |
| Cohere embeddings | 1,000 calls/month | Switch to OpenAI embeddings |
| MongoDB M0 | 512MB | Upgrade to M2 ($9/month) |

---

## Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-04-21 | AI in `my-bank-api/modules/ai/` not separate service | Solo dev, simplicity first |
| 2026-04-21 | Groq over OpenAI | Free tier, same API format |
| 2026-04-21 | Atlas Vector Search over Pinecone | Already have MongoDB |
| 2026-04-21 | Vercel AI SDK for chat UI | `useChat` > custom RTK Query for chat |
| 2026-04-21 | LangGraph for Phase 3 only | Overkill for Phase 1-2 |
