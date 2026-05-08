# MyBank API — Architecture

---

## System Overview

```
Browser (my-bank-customer)       Browser (my-bank-admin-portal)
        │                                 │
        └──────────────────┬──────────────┘
                          │
                  [Vercel Load Balancer]
                          │
                ┌─────────┴─────────┐
                │                   │
        [my-bank-api]      [notification-service]
        Port 5000              Port 5001
           │                      │
        [MongoDB]         [MongoDB]
        (shared)          (isolated)
```

---

## Module Architecture (Modular Monolith)

```
src/
├── app/                         ← Express app setup
├── config/                      ← Config variables
├── modules/                     ← 8 domain modules
│   ├── accounts/                ← Account CRUD, deposit, withdraw, airdrop
│   │   ├── account.controller.js
│   │   ├── account.routes.js
│   │   └── account.middleware.js
│   │
│   ├── admin/                   ← Application approval, user management
│   │   ├── admin.controller.js
│   │   └── admin.routes.js
│   │
│   ├── ai/                      ← Phase 1-4 chatbot + insights (future)
│   │   ├── ai.controller.js
│   │   ├── ai.routes.js
│   │   ├── ai.service.js
│   │   └── ai.guardrails.js
│   │
│   ├── audit/                   ← Activity logging
│   │   ├── audit.controller.js
│   │   ├── audit.routes.js
│   │   └── audit.service.js
│   │
│   ├── auth/                    ← JWT login/register
│   │   ├── auth.controller.js
│   │   └── auth.routes.js
│   │
│   ├── expenses/                ← Expense tracking
│   │   ├── expense.controller.js
│   │   └── expense.routes.js
│   │
│   ├── onboarding/              ← Application, verification, profile
│   │   ├── onboarding.controller.js
│   │   ├── onboarding.routes.js
│   │   └── onboarding.service.js
│   │
│   ├── transactions/            ← Transfer logic
│   │   ├── transaction.controller.js
│   │   ├── transaction.routes.js
│   │   └── transaction.service.js
│   │
│   └── users/                   ← Profile, KYC
│       ├── user.controller.js
│       └── user.routes.js
│
├── shared/                      ← Cross-module concerns
│   ├── models/                  ← 8 Mongoose models
│   │   ├── User.js
│   │   ├── Account.js
│   │   ├── Transaction.js
│   │   ├── Application.js
│   │   ├── ActivityLog.js
│   │   ├── Notification.js
│   │   ├── Expense.js
│   │   └── AiAuditLog.js (Phase 3)
│   │
│   ├── middleware/              ← Express middleware
│   │   ├── auth.js              ← JWT verification
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   │
│   ├── services/                ← Business logic
│   │   ├── transactionService.js
│   │   ├── notificationService.js
│   │   └── expenseService.js
│   │
│   ├── utils/                   ← Helpers
│   │   ├── response.js          ← success() / error()
│   │   ├── validators.js        ← Input validation
│   │   └── helpers.js
│   │
│   └── constants/               ← Constants
│       ├── roles.js
│       ├── statuses.js
│       └── categories.js
│
└── server.js                    ← Express server entry point
```

---

## Data Flow (Example: Transfer)

```
1. Client (my-bank-customer)
   POST /api/v1/transfer
   Body: { fromAccountNumber, toAccountNumber, amount, description }

2. my-bank-api Route Handler
   POST /transfer → transaction.controller.js

3. Controller → Service Layer
   transactionService.transferFunds(from, to, amount)

4. Service Layer (Business Logic)
   a) Find both accounts
   b) Check balance sufficiency
   c) Create 2 Transaction records
   d) Update both Account balances
   e) MongoDB session.startTransaction() → commit/abort
   f) Call notificationService (non-blocking)
   g) Call auditLogger (non-blocking)

5. Response
   200 { success: true, transactions: [...], accounts: [...] }

6. Async Side-Effects
   - notification-service receives webhook POST /notify
   - ActivityLog records TRANSFER_INITIATED + TRANSACTION_COMPLETE
```

---

## API Routing

```
/auth
  POST /login                     ← JWT + httpOnly cookie
  POST /register
  GET  /check-token              ← Verify token on app init

/onboarding
  POST /apply                     ← Customer submits application
  POST /verify                    ← Admin verifies identity
  PATCH /profile                  ← Customer completes profile

/accounts
  POST /create                    ← Create account
  GET  /                          ← List user's accounts
  GET  /:accountNumber            ← Get account details
  POST /deposit                   ← Add money
  POST /withdraw                  ← Remove money
  DELETE /:accountNumber          ← Close account (balance = 0)

/transactions
  POST /transfer                  ← Transfer between accounts
  GET  /:accountNumber/history    ← View transaction history

/admin
  GET  /applications              ← Pending applications
  PATCH /approve                  ← Approve + auto-create account
  PATCH /reject                   ← Reject + send notification
  GET  /users                     ← All users
  GET  /staff                     ← Manage bankers
  POST /staff                     ← Create banker account

/audit
  GET  /logs                      ← Activity logs (paginated)
  GET  /user-activity/:userId     ← User's activity

/expenses
  POST /create                    ← Create expense
  GET  /                          ← List expenses
  PUT  /:id                       ← Update expense
  DELETE /:id                     ← Delete expense

/users
  GET  /profile                   ← Own profile
  PUT  /profile                   ← Update own profile
  GET  /:id                       ← Admin: view any user

/ai (Phase 1-4)
  POST /ask                       ← Chat question (Phase 1)
  POST /insights                  ← Spend analysis (Phase 2)
  POST /agent                     ← Multi-turn advisor (Phase 3)
```

---

## Database Models (8 Collections)

| Model            | Purpose                          | Key Fields                                        |
| ---------------- | -------------------------------- | ------------------------------------------------- |
| **User**         | Customer, banker, admin accounts | email, password, role, KYC, dateCreated           |
| **Account**      | Bank accounts                    | user, accountNumber, balance, accountType, status |
| **Transaction**  | Money movements                  | account, amount, type, status, date               |
| **Application**  | Onboarding workflow              | email, status, approvedBy, rejectionReason        |
| **ActivityLog**  | Audit trail                      | action, userId, status, timestamp, ip             |
| **Notification** | Event notifications              | type, recipient, message, read, delivered         |
| **Expense**      | Expense tracking                 | user, amount, category, date                      |
| **AiAuditLog**   | AI query logs (Phase 3)          | userId, query, response, toolCalls, timestamp     |

See [SCHEMA-OVERVIEW.md](../MODELS/SCHEMA-OVERVIEW.md) for detailed schema.

---

## Money Flow (Core Banking)

### Deposit (Single-Account Operation)

```
1. Banker POSTs /accounts/deposit
2. Find account, validate amount
3. Create Transaction record (amount: +500)
4. Update Account.balance += 500
5. MongoDB session ensures both succeed or both fail
6. Notify customer (async, non-blocking)
7. Log activity (async, non-blocking)
```

### Transfer (Two-Account Operation, Atomic)

```
1. Customer POSTs /transactions/transfer
2. Find from + to accounts
3. Check from.balance >= amount
4. Create TWO Transaction records (from: -500, to: +500)
5. Update BOTH Account.balance (from -= 500, to += 500)
6. MongoDB session: saveTransaction1, saveTransaction2, saveAccount1, saveAccount2, then commit
   → If any fails, abort all (all-or-nothing)
7. Notify both parties (async)
8. Log activity (async)
```

### Airdrop (Admin-Only, Single-Account)

```
1. Admin POSTs /accounts/airdrop
2. Find account (any account, no ownership check)
3. Create Transaction record (amount: +1000, type: "airdrop")
4. Update Account.balance += 1000
5. MongoDB session ensures atomicity
6. Notify customer (async)
7. Log activity (async)
```

---

## Authentication & Authorization

**JWT Flow:**

1. Login: POST /auth/login → verify email + password → issue JWT + httpOnly cookie
2. Request: GET /api/\* with cookie → middleware extracts JWT → verifies signature + expiry
3. Middleware: req.user = { id, email, role }
4. Role check: if (req.user.role !== 'admin') return 403

See [AUTHENTICATION.md](../SECURITY/AUTHENTICATION.md) and [AUTHORIZATION.md](../SECURITY/AUTHORIZATION.md).

---

## Error Handling

All endpoints return standardized response:

**Success:**

```json
{ "success": true, "data": {...}, "statusCode": 200 }
```

**Error:**

```json
{
  "success": false,
  "error": "INSUFFICIENT_FUNDS",
  "message": "...",
  "statusCode": 400
}
```

Uses `success()` and `error()` helpers from `shared/utils/response.js`.

---

## Testing Strategy

| Layer           | Test Type                       | Tool                         |
| --------------- | ------------------------------- | ---------------------------- |
| **Unit**        | Service layer logic             | Jest                         |
| **Integration** | Controller → Service → Database | Jest + MongoDB memory server |
| **E2E**         | Full request flow               | Postman / REST Client        |

---

## Deployment

- **API:** Vercel (serverless) or Railway (traditional)
- **Database:** MongoDB Atlas (free M0 or paid M2+)
- **Notifications:** notification-service runs separately (Docker or Railway)

---

## Future: Microservices Split

If this grows, we can extract:

- **AI Service** → `my-bank-ai` (Groq LLM, embeddings, agents)
- **Analytics Service** → `my-bank-analytics` (expense trends, fraud detection)
- **Mobile App** → `my-bank-mobile` (React Native)

Current monolith is optimized for solo dev + early scale.

---

**Last Updated:** May 8, 2026
