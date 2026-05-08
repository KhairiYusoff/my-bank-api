# MyBank — Data Models (Schema Overview)

All models live in `src/shared/models/`.

---

## 1. User Model

**Purpose:** Customer, banker, admin accounts

**Schema:**

```javascript
{
  email: String (unique, lowercase),
  password: String (bcrypted),
  firstName: String,
  lastName: String,
  role: String (enum: ["customer", "banker", "admin"]),
  phone: String,
  address: String,
  identityNumber: String (KYC),

  // Audit
  createdAt: Date,
  updatedAt: Date,
  status: String (enum: ["active", "inactive", "suspended"])
}
```

**Indexes:**

- `email` (unique, fast login)
- `role` (filter by role)
- `createdAt` (recent users)

**Constraints:**

- Email must be unique and valid
- Password min 8 chars, hashed with bcrypt
- role is one of: customer, banker, admin

---

## 2. Account Model

**Purpose:** Bank accounts (Savings, Checking, Business)

**Schema:**

```javascript
{
  user: ObjectId (ref: User),
  accountNumber: String (unique, format: "MYB" + timestamp),
  accountType: String (enum: ["Savings", "Checking", "Business"]),
  branch: String,
  balance: Number (default: 0, represents cents: 5000 = RM 50.00),
  currency: String (default: "MYR"),
  interestRate: Number (optional, e.g., 3.5),
  overdraftLimit: Number (optional),
  minimumBalance: Number (default: 0),

  // Status
  status: String (enum: ["Active", "Dormant", "Closed"]),
  dateOpened: Date (default: now),
  dateClosed: Date (set on closure)
}
```

**Indexes:**

- `user` (customer's accounts)
- `accountNumber` (unique)
- `status` (filter by status)
- `accountType` (filter by type)

**Constraints:**

- `balance >= 0` (no negative, enforced in code)
- `user` is required
- `accountNumber` must be unique
- Status can only change: Active → Dormant → Closed (not reversible)

**Money Flow:**

- Deposit: `balance += amount`
- Withdraw: `balance -= amount` (if balance >= amount)
- Transfer: `fromAccount.balance -= amount`, `toAccount.balance += amount`
- Airdrop: `balance += amount`

---

## 3. Transaction Model

**Purpose:** Record all money movements (deposit, withdraw, transfer, airdrop)

**Schema:**

```javascript
{
  account: ObjectId (ref: Account),
  type: String (enum: ["deposit", "withdrawal", "airdrop", "transfer"]),
  amount: Number (in cents, always positive),
  description: String,
  status: String (enum: ["pending", "completed", "failed"], default: "completed"),
  performedBy: ObjectId (ref: User),
  date: Date (default: now),

  // Extra for transfers
  relatedTransaction: ObjectId (ref: Transaction) // The matching transfer out
}
```

**Indexes:**

- `account` (account history)
- `performedBy` (user transactions)
- `type` (filter by type)
- `status` (filter by status)
- `date` (recent first)
- `account + date` (account history sorted)

**Constraints:**

- `amount` always positive (sign conveyed by `type`)
- `account` is required
- `performedBy` is required
- Status starts as "completed" (no pending state currently)

**Atomicity:**

- Deposit: Create transaction record + update account balance in same MongoDB session
- Withdraw: Create transaction record + update account balance in same session
- Transfer: Create 2 transaction records + update 2 account balances in same session
- All-or-nothing: If any save fails, entire session rolls back

---

## 4. Application Model

**Purpose:** Onboarding workflow (apply → verify → approve → profile)

**Schema:**

```javascript
{
  email: String (unique per application),
  firstName: String,
  lastName: String,
  identityNumber: String (national ID, verified by admin),
  address: String,
  phoneNumber: String,

  // Status
  status: String (enum: ["pending_verification", "approved", "rejected"]),
  approvedBy: ObjectId (ref: User, admin who approved),
  rejectionReason: String (if rejected),

  // Audit
  createdAt: Date,
  approvedAt: Date,
  rejectedAt: Date,

  // Linked user
  user: ObjectId (ref: User, set after approval)
}
```

**Indexes:**

- `email` (unique per app)
- `status` (filter pending apps)
- `user` (find app by user)
- `createdAt` (recent apps)

**Workflow:**

1. Customer: `POST /onboarding/apply` → create Application with status "pending_verification"
2. Admin: `PATCH /onboarding/verify` → status = "approved", auto-create User + Account
3. Customer: `PATCH /onboarding/profile` → complete profile
4. OR Admin: `PATCH /onboarding/reject` → status = "rejected", send notification

---

## 5. ActivityLog Model

**Purpose:** Audit trail for compliance (who did what, when, from where)

**Schema:**

```javascript
{
  action: String (enum: ["LOGIN", "LOGOUT", "TRANSFER", "DEPOSIT", ...]),
  userId: ObjectId (ref: User),
  targetUser: ObjectId (optional, if action targets another user),
  status: String (enum: ["success", "failed"]),
  timestamp: Date (default: now),
  ip: String (user's IP address),
  userAgent: String (browser info),

  // Metadata (varies by action)
  metadata: {
    fromAccount: String (for TRANSFER),
    toAccount: String (for TRANSFER),
    amount: Number (for TRANSFER, DEPOSIT, WITHDRAW),
    reason: String (for rejection),
    // ... action-specific fields
  }
}
```

**Indexes:**

- `userId` (user's activity)
- `action` (filter by action)
- `timestamp` (recent first)
- `userId + action` (user's transfers, etc.)

**Immutability:**

- ActivityLog entries are NEVER updated or deleted
- Only inserts (append-only ledger)
- Ensures non-repudiation for compliance

**HIGH-Severity Actions (always logged):**

- LOGIN, LOGIN_FAILED, LOGOUT
- DEPOSIT, WITHDRAW, AIRDROP, TRANSFER
- ACCOUNT_CREATION, ACCOUNT_CLOSURE
- CUSTOMER_APPLICATION, CUSTOMER_REGISTRATION
- PROFILE_UPDATED
- ADMIN_APPROVAL, ADMIN_REJECTION

---

## 6. Notification Model

**Purpose:** Event-driven notifications (sent async, non-blocking)

**Schema:**

```javascript
{
  type: String (enum: ["deposit", "withdraw", "transfer", "airdrop", "approve", "reject", "verify"]),
  title: String,
  message: String,
  link: String (route to navigate to),

  // Recipient
  recipient: {
    role: String (enum: ["customer", "banker", "admin"]),
    userId: ObjectId (ref: User)
  },

  // Source
  source: {
    service: String (e.g., "my-bank-api"),
    id: ObjectId (transaction ID, application ID, etc.)
  },

  // Data (JSON blob, varies by type)
  data: {
    amount: Number,
    accountNumber: String,
    // ... type-specific fields
  },

  // Status
  read: Boolean (default: false),
  delivered: Boolean (default: false),
  createdAt: Date
}
```

**Indexes:**

- `recipient.userId` (notifications for user)
- `read` (unread count)
- `createdAt` (recent first)

**Lifecycle:**

1. Created by my-bank-api: `delivered = false, read = false`
2. notification-service receives POST `/notify` webhook
3. notification-service inserts Notification doc: `delivered = true`
4. Frontend marks as `read = true` on view

**Triggers:**

- Deposit: Customer/banker deposits money
- Withdraw: Customer withdraws money
- Transfer: Both parties get notifications
- Airdrop: Customer receives promotional credit
- Approve: Customer approved, account created
- Verify: Admin verified customer
- Reject: Application rejected

---

## 7. Expense Model

**Purpose:** Track user expenses (separate from account balance)

**Schema:**

```javascript
{
  user: ObjectId (ref: User),
  amount: Number (in cents, e.g., 5000 = RM 50.00),
  category: String (enum: ["Food", "Transport", "Entertainment", "Shopping", "Utilities", "Medical", "Other"]),
  date: Date (expense date, not creation date),
  notes: String (optional, e.g., "Lunch at Pavilion"),

  // Audit
  createdAt: Date (when expense was logged),
  updatedAt: Date
}
```

**Indexes:**

- `user` (user's expenses)
- `category` (filter by category)
- `date` (expenses over time)
- `user + date` (user's expenses sorted)

**Constraints:**

- `amount > 0`
- `category` is one of enum values
- `user` is required

**Note:** Expenses do NOT affect account balance. They're metadata for tracking spending habits.

---

## 8. AiAuditLog Model (Phase 3)

**Purpose:** Log all AI queries for compliance + debugging

**Schema:**

```javascript
{
  userId: ObjectId (ref: User),
  conversationId: String,
  query: String (user's question),
  response: String (AI's answer),

  // Tools
  toolCalls: [
    {
      tool: String (e.g., "getAccountSummary"),
      input: Object,
      output: Object,
      status: String (enum: ["success", "failed"])
    }
  ],

  // PII Masking
  piiMasked: Boolean (true if query contained PII before masking),

  // Audit
  timestamp: Date,
  model: String (e.g., "llama-3.3-70b"),
  tokensUsed: Number,
  latency: Number (milliseconds)
}
```

**Indexes:**

- `userId` (user's AI queries)
- `timestamp` (recent first)
- `conversationId` (conversation history)

**Immutability:**

- Like ActivityLog, only inserts
- Never updated or deleted

---

## Relationships Diagram

```
User
  ├─ Accounts (1 → N)
  ├─ Transactions (1 → N, as performedBy)
  ├─ Expenses (1 → N)
  ├─ Applications (1 → 1, after approval)
  ├─ ActivityLogs (1 → N)
  └─ AiAuditLogs (1 → N)

Account
  ├─ User (many → 1)
  └─ Transactions (1 → N)

Transaction
  ├─ Account (many → 1)
  └─ User/performedBy (many → 1)

Application
  ├─ User (many → 1, after approval)
  └─ ApprovedBy/User (many → 1, admin who approved)

Notification
  ├─ User/recipient (many → 1)
  └─ Source ID (flexible, can reference Transaction, Application, etc.)
```

---

## Data Integrity Rules

### Account Balance

- ✅ Affected by: Deposit, Withdraw, Transfer, Airdrop
- ❌ Affected by: Expenses (separate tracking)
- 🔒 Constraint: `balance >= 0` (enforced in code, not DB)
- 🔒 Atomicity: Update in MongoDB session only

### Transaction Records

- ✅ Immutable (no updates after creation)
- ✅ Every money operation creates at least 1 record
- ✅ Transfer creates 2 records (from + to)

### Audit Logs

- ✅ Immutable (append-only)
- ✅ Every HIGH-severity action logged
- ✅ IP + user agent captured (debugging, security)

---

**Last Updated:** May 8, 2026
