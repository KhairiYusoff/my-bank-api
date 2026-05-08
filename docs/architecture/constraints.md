# MyBank API — Constraints & Patterns

> These rules are non-negotiable. Follow them without exception.

---

## Folder & File Naming

| Type            | Convention | Example                                           |
| --------------- | ---------- | ------------------------------------------------- |
| **Controllers** | camelCase  | `accountController.js`, `authController.js`       |
| **Routes**      | camelCase  | `accountRoutes.js`, `authRoutes.js`               |
| **Services**    | camelCase  | `transactionService.js`, `notificationService.js` |
| **Models**      | PascalCase | `User.js`, `Account.js`, `Transaction.js`         |
| **Middleware**  | camelCase  | `authMiddleware.js`, `errorHandler.js`            |
| **Utilities**   | camelCase  | `validators.js`, `helpers.js`, `response.js`      |
| **Config**      | camelCase  | `db.js`, `roles.js`, `constants.js`               |

---

## Code Patterns (Mandatory)

### 1. Response Format

**Every endpoint** uses `success()` or `error()` from `shared/utils/response.js`:

```javascript
// ✅ CORRECT
const { success, error } = require("../../shared/utils/response");

exports.createAccount = async (req, res) => {
  try {
    const account = new Account({ ...data });
    await account.save();
    return success(res, {
      message: "Account created",
      data: account,
      statusCode: 201,
    });
  } catch (err) {
    return error(res, {
      message: err.message,
      statusCode: 500,
    });
  }
};

// ❌ WRONG
return res.status(201).json({ message: "OK" });
```

---

### 2. Service Layer (Business Logic)

**Never put business logic in controllers.** Controllers only handle HTTP.

```javascript
// ✅ CORRECT

// Controller
exports.transfer = async (req, res) => {
  try {
    const result = await transactionService.transferFunds(
      req.body.fromAccountNumber,
      req.body.toAccountNumber,
      req.body.amount,
      req.user.id
    );
    return success(res, { data: result });
  } catch (err) {
    return error(res, { message: err.message });
  }
};

// Service
async transferFunds(from, to, amount, userId) {
  const fromAccount = await Account.findOne({ accountNumber: from, user: userId });
  if (!fromAccount) throw new Error("Account not found");
  if (fromAccount.balance < amount) throw new Error("Insufficient funds");

  // MongoDB session here
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    // Save transaction + account
    await session.commitTransaction();
  } catch (err) {
    await session.abortTransaction();
    throw err;
  } finally {
    session.endSession();
  }
}

// ❌ WRONG — Business logic in controller
exports.transfer = async (req, res) => {
  const fromAccount = await Account.findOne(...);
  if (fromAccount.balance < req.body.amount) return error(res, ...);
  // ... all logic here
};
```

---

### 3. MongoDB Atomic Transactions (Money Operations)

**All money operations MUST be atomic:**

```javascript
// ✅ CORRECT
const session = await mongoose.startSession();
session.startTransaction();

try {
  await fromTransaction.save({ session });
  await toTransaction.save({ session });
  await fromAccount.save({ session });
  await toAccount.save({ session });
  await session.commitTransaction();
} catch (err) {
  await session.abortTransaction();
  throw err;
} finally {
  session.endSession();
}

// ❌ WRONG — No transaction
await fromTransaction.save();
await toTransaction.save();
await fromAccount.save();
// If save() #3 fails, #1 and #2 are orphaned!
```

---

### 4. Access Control (Authorization)

**Check role + ownership before accessing data:**

```javascript
// ✅ CORRECT
exports.getAccounts = async (req, res) => {
  // Customer can only view own accounts
  if (req.user.role === "customer") {
    const accounts = await Account.find({ user: req.user.id });
    return success(res, { data: accounts });
  }

  // Banker/Admin can view any accounts
  const accounts = await Account.find();
  return success(res, { data: accounts });
};

// ❌ WRONG — No ownership check
exports.getAccounts = async (req, res) => {
  const accounts = await Account.find();
  return success(res, { data: accounts });
};
```

---

### 5. Input Validation (Zod)

**Validate ALL inputs at controller boundary:**

```javascript
// ✅ CORRECT
const { transferSchema } = require("../../shared/schemas/transfer.schema");

exports.transfer = async (req, res) => {
  const parsed = transferSchema.safeParse(req.body);
  if (!parsed.success) {
    return error(res, {
      message: "Validation failed",
      statusCode: 400,
      errors: parsed.error.issues,
    });
  }

  const { fromAccountNumber, toAccountNumber, amount } = parsed.data;
  // ... proceed with validated data
};

// ❌ WRONG — No validation
exports.transfer = async (req, res) => {
  const { fromAccountNumber, toAccountNumber, amount } = req.body;
  // amount could be "abc", negative, null, etc.
};
```

---

### 6. Audit Logging (Middleware)

**Log HIGH-severity actions automatically:**

```javascript
// ✅ CORRECT — On every money operation route
const { activityLogger } = require('../../shared/services/auditService');

router.post('/transfer',
  requireAuth,
  activityLogger('TRANSFER_INITIATED'),  // Auto-logs before handler
  controller.transfer
);

// ❌ WRONG — Manual logging
exports.transfer = async (req, res) => {
  // ... transfer logic
  await ActivityLog.create({ action: 'TRANSFER_INITIATED', ... });
};
```

---

### 7. Notifications (Non-Blocking)

**Notifications are ALWAYS fire-and-forget:**

```javascript
// ✅ CORRECT
const sendNotification = require('../../shared/services/notificationService');

exports.deposit = async (req, res) => {
  // ... deposit logic
  await account.save();

  // Send notification (async, don't await)
  sendNotification({
    type: "deposit",
    recipient: { role: "customer", userId: account.user.toString() },
    data: { amount, accountNumber: account.accountNumber }
  }).catch(err => console.error("Notification failed:", err));

  return success(res, { data: { account } });
};

// ❌ WRONG — Blocking notification
exports.deposit = async (req, res) => {
  await account.save();
  await sendNotification(...); // If notification-service is down, deposit fails!
  return success(res, ...);
};
```

---

### 8. Error Handling

**Never expose stack traces to client:**

```javascript
// ✅ CORRECT
try {
  const account = await Account.findById(id);
  if (!account) throw new Error("Account not found");
  return success(res, { data: account });
} catch (err) {
  console.error(err.stack); // Log internally
  return error(res, {
    message: "Internal server error", // Generic message to client
    statusCode: 500
  });
}

// ❌ WRONG
catch (err) {
  return error(res, {
    message: err.stack, // Stack trace exposed!
    statusCode: 500
  });
}
```

---

### 9. Comments (Enterprise Standard)

**Add comments above non-obvious logic:**

```javascript
// ✅ CORRECT
// Only allow customers to view their own accounts
if (req.user.role === "customer") {
  accounts = await Account.find({ user: req.user.id });
}

// MongoDB session ensures atomicity: both saves succeed or both rollback
const session = await mongoose.startSession();
session.startTransaction();

// ❌ WRONG — No comments
if (req.user.role === "customer") {
  accounts = await Account.find({ user: req.user.id });
}
```

---

## API Patterns (Mandatory)

### 1. Pagination

**Always use: page, limit, total, pages**

```javascript
const page = Math.max(parseInt(req.query.page, 10), 1);
const limit = Math.max(parseInt(req.query.limit, 10), 10);
const skip = (page - 1) * limit;

const [total, items] = await Promise.all([
  Model.countDocuments(filter),
  Model.find(filter).skip(skip).limit(limit),
]);

return success(res, {
  data: items,
  meta: {
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
  },
});
```

---

### 2. Route Naming

**RESTful conventions:**

```javascript
// ✅ CORRECT
POST   /api/v1/accounts              ← Create
GET    /api/v1/accounts              ← List (all or filtered)
GET    /api/v1/accounts/:id          ← Get one
PATCH  /api/v1/accounts/:id          ← Update
DELETE /api/v1/accounts/:id          ← Delete

POST   /api/v1/transactions/transfer ← Action (not /transfer, but namespaced)

// ❌ WRONG
GET    /api/v1/getAccounts
POST   /api/v1/createAccount
POST   /api/v1/transfer              ← Should be /transactions/transfer
```

---

### 3. Status Codes

**Use correct HTTP status:**

```javascript
200 — Success, data returned
201 — Created (POST successful)
400 — Bad request (validation error, client fault)
401 — Unauthorized (no JWT)
403 — Forbidden (JWT valid, but no permission)
404 — Not found (resource doesn't exist)
409 — Conflict (duplicate email, already verified)
500 — Server error (unexpected error)
```

---

## Database Patterns

### 1. Indexing

**Always index frequently queried fields:**

```javascript
// ✅ CORRECT
UserSchema.index({ email: 1 }); // Login queries
AccountSchema.index({ user: 1 }); // User's accounts
TransactionSchema.index({ account: 1 }); // Account history
TransactionSchema.index({ date: -1 }); // Recent first
```

---

### 2. Relationships

**Use Mongoose `ref` for relationships:**

```javascript
// ✅ CORRECT
const AccountSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  ...
});

const account = await Account.findById(id).populate("user", "name email");

// ❌ WRONG — Duplication
const AccountSchema = new Schema({
  userId: String,
  userName: String,  // Redundant!
  ...
});
```

---

## Module Interdependencies (Allowed)

**Only these directions are allowed:**

```
┌─────────────────────────────────────┐
│                                     │
│  All modules → shared/              │ ✅ OK
│  modules/transactions → accounts/   │ ✅ OK (transfer needs both)
│  modules/* → modules/*              │ ❌ NOT OK (use services instead)
│  shared/* → shared/*                │ ✅ OK
│                                     │
└─────────────────────────────────────┘
```

---

## Environment Variables

**Required in .env.local:**

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/mybank
JWT_SECRET=your-secret-key-here-min-32-chars
NODE_ENV=development
PORT=5000
NOTIFICATION_SERVICE_URL=http://localhost:5001
GROQ_API_KEY=[Phase 1]
YOUTUBE_API_KEY=[Phase 2+]
```

**Never hardcode secrets. Always use `process.env`.**

---

**Last Updated:** May 8, 2026
