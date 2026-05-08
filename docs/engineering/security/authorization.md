# MyBank — Authorization (RBAC Matrix)

---

## Roles

MyBank has **3 roles**:

| Role         | Purpose      | Access Level                                         |
| ------------ | ------------ | ---------------------------------------------------- |
| **customer** | End user     | Own accounts + expenses only                         |
| **banker**   | Bank staff   | Any account (deposit/withdraw), view audit logs      |
| **admin**    | System admin | All operations (approve apps, manage users, airdrop) |

---

## RBAC Matrix

| Endpoint                     | customer             | banker   | admin    |
| ---------------------------- | -------------------- | -------- | -------- |
| **Auth**                     |                      |          |          |
| POST /auth/login             | ✅                   | ✅       | ✅       |
| POST /auth/register          | ✅                   | ❌       | ❌       |
| GET /auth/check-token        | ✅                   | ✅       | ✅       |
| **Onboarding**               |                      |          |          |
| POST /onboarding/apply       | ✅ (unauthenticated) | ❌       | ❌       |
| PATCH /onboarding/verify     | ❌                   | ❌       | ✅       |
| PATCH /onboarding/profile    | ✅ (own only)        | ❌       | ❌       |
| **Accounts**                 |                      |          |          |
| POST /accounts/create        | ❌                   | ❌       | ✅       |
| GET /accounts                | ✅ (own)             | ✅ (all) | ✅ (all) |
| GET /accounts/:id            | ✅ (own)             | ✅ (all) | ✅ (all) |
| POST /accounts/deposit       | ✅ (own)             | ✅ (any) | ✅ (any) |
| POST /accounts/withdraw      | ✅ (own)             | ✅ (any) | ✅ (any) |
| POST /accounts/airdrop       | ❌                   | ❌       | ✅       |
| DELETE /accounts/:id         | ✅ (own, balance=0)  | ❌       | ✅ (any) |
| **Transactions**             |                      |          |          |
| POST /transactions/transfer  | ✅ (from own)        | ❌       | ❌       |
| GET /transactions/history    | ✅ (own)             | ✅ (all) | ✅ (all) |
| **Admin**                    |                      |          |          |
| GET /admin/applications      | ❌                   | ❌       | ✅       |
| PATCH /admin/approve         | ❌                   | ❌       | ✅       |
| PATCH /admin/reject          | ❌                   | ❌       | ✅       |
| GET /admin/users             | ❌                   | ❌       | ✅       |
| POST /admin/staff            | ❌                   | ❌       | ✅       |
| **Audit**                    |                      |          |          |
| GET /audit/logs              | ❌                   | ❌       | ✅       |
| GET /audit/user-activity/:id | ❌                   | ❌       | ✅       |
| **Expenses**                 |                      |          |          |
| POST /expenses/create        | ✅                   | ❌       | ✅       |
| GET /expenses                | ✅ (own)             | ❌       | ✅ (all) |
| PUT /expenses/:id            | ✅ (own)             | ❌       | ✅ (any) |
| DELETE /expenses/:id         | ✅ (own)             | ❌       | ✅ (any) |
| **Users**                    |                      |          |          |
| GET /users/profile           | ✅ (own)             | ✅ (own) | ✅ (own) |
| PUT /users/profile           | ✅ (own)             | ✅ (own) | ✅ (own) |
| GET /users/:id               | ❌                   | ❌       | ✅       |
| **AI** (Phase 1+)            |                      |          |          |
| POST /ai/ask                 | ✅                   | ✅       | ✅       |
| POST /ai/insights            | ✅                   | ❌       | ✅       |

---

## Authorization Logic (Code Patterns)

### Pattern 1: Role-Based Check

**Example: Admin only**

```javascript
// Middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return error(res, {
      message: "Forbidden: admin only",
      statusCode: 403,
    });
  }
  next();
};

// Route
router.post("/admin/approve", requireAuth, requireAdmin, controller.approve);
```

---

### Pattern 2: Ownership Check (Customer)

**Example: Customer can only view own accounts**

```javascript
exports.getAccounts = async (req, res) => {
  if (req.user.role === "customer") {
    // Customer: only own accounts
    const accounts = await Account.find({ user: req.user.id });
  } else {
    // Banker/Admin: all accounts
    const accounts = await Account.find();
  }
  return success(res, { data: accounts });
};
```

---

### Pattern 3: Ownership + Role Check (Multi-level)

**Example: Customer can deposit to own account, banker to any**

```javascript
exports.deposit = async (req, res) => {
  const { accountNumber, amount } = req.body;

  const query = { accountNumber };

  // If customer, restrict to own account
  if (req.user.role === "customer") {
    query.user = req.user.id;
  }
  // If banker/admin, can access any account

  const account = await Account.findOne(query);
  if (!account) {
    return error(res, {
      message: "Account not found or access denied",
      statusCode: 404,
    });
  }

  // Proceed with deposit
  // ...
};
```

---

### Pattern 4: Explicit Role Enum

**Example: Only customer or banker (not admin)**

```javascript
const ALLOWED_ROLES = ["customer", "banker"];

if (!ALLOWED_ROLES.includes(req.user.role)) {
  return error(res, {
    message: "Forbidden: invalid role",
    statusCode: 403,
  });
}
```

---

## Scoping by Role

### Customer Scope

- ✅ Can view own profile, own accounts, own transactions, own expenses
- ❌ Cannot view other users' data
- ❌ Cannot approve applications or manage staff

### Banker Scope

- ✅ Can view all accounts, all users, all transactions
- ✅ Can deposit/withdraw on behalf of customers
- ✅ Can view audit logs (future: filter by service)
- ❌ Cannot approve applications (admin only)
- ❌ Cannot manage staff

### Admin Scope

- ✅ Full access to everything
- ✅ Can approve/reject applications
- ✅ Can manage bankers and staff
- ✅ Can airdrop money (testing)
- ✅ Can view all audit logs

---

## Special Cases

### Unauthenticated Routes

- `POST /auth/login` — No auth needed
- `POST /auth/register` — No auth needed
- `POST /onboarding/apply` — No auth needed (initial application)

### Mixed Permissions

- `POST /accounts/deposit` — Customer (own) OR banker (any) OR admin (any)
- `GET /users/profile` — Customer (own) OR banker (own) OR admin (own)
- `PUT /users/profile` — Customer (own) OR banker (own) OR admin (own)

---

## Authorization Errors

| Scenario                                   | Status | Response                        |
| ------------------------------------------ | ------ | ------------------------------- |
| No JWT token provided                      | 401    | `{ error: "NO_TOKEN" }`         |
| JWT expired or invalid                     | 401    | `{ error: "INVALID_TOKEN" }`    |
| Valid JWT, but role not allowed            | 403    | `{ error: "FORBIDDEN" }`        |
| Valid JWT, but accessing other user's data | 403    | `{ error: "FORBIDDEN" }` OR 404 |

---

## Audit Trail

**Every authorization check logged:**

```javascript
if (req.user.role !== "admin") {
  console.error(`UNAUTHORIZED: ${req.user.id} tried to approve application`);
  // Also logged to ActivityLog as failed action
  return error(res, { statusCode: 403 });
}
```

---

## Future: Fine-Grained Permissions

If this grows, consider:

- **Permissions per role** (e.g., "can_approve_customers", "can_view_audit_logs")
- **Resource-level permissions** (e.g., banker can only manage accounts in their branch)
- **Time-based permissions** (e.g., senior banker can override limits)

For now, 3 static roles are sufficient.

---

**Last Updated:** May 8, 2026
