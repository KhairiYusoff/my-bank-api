# MyBank — Authorization (RBAC Matrix)

---

## Roles

MyBank has **4 roles**:

| Role         | Purpose          | Access Level                                                        | Platform             |
| ------------ | ---------------- | ------------------------------------------------------------------- | -------------------- |
| **customer** | End user         | Own accounts, own transactions, own expenses only                   | my-bank-customer     |
| **banker**   | Branch staff     | Transactions on any account, onboarding approvals, view audit trail | my-bank-admin-portal |
| **auditor**  | Internal auditor | Read-only — all data including unmasked detail, all audit logs      | my-bank-admin-portal |
| **admin**    | System admin     | Full access — staff management, user status, airdrop                | my-bank-admin-portal |

### Why 4 and not 3

`banker` and `admin` used to both approve applications and both had audit log access. This violates **separation of duties** — a core CIA principle for fraud detection. The new `auditor` role is read-only with no ability to mutate any data, meaning:

- An auditor can investigate without being able to cover tracks
- A banker cannot see the full audit log and therefore cannot hide their own actions from investigation
- Admin manages people and system config but cannot run transactions

---

## RBAC Matrix (Access & Navigation)

| Endpoint | customer | banker | auditor | admin |
| :--- | :---: | :---: | :---: | :---: |
| **Auth** | | | | |
| POST /auth/login | ✅ | ✅ | ✅ | ✅ |
| POST /auth/register | ✅ | ❌ | ❌ | ❌ |
| GET /auth/check-token | ✅ | ✅ | ✅ | ✅ |
| **Onboarding** | | | | |
| POST /onboarding/apply | ✅ | ❌ | ❌ | ❌ |
| PUT /onboarding/complete-profile | ✅ | ❌ | ❌ | ❌ |
| GET /onboarding/pending | ❌ | ✅ | ✅ | ✅ |
| POST /onboarding/approve/:userId | ❌ | ✅ | ❌ | ✅ |
| POST /onboarding/verify/:userId | ❌ | ✅ | ❌ | ✅ |
| **Accounts** | | | | |
| POST /accounts/create | ❌ | ✅ | ❌ | ✅ |
| DELETE /accounts/:accountNumber | ✅ | ✅ | ❌ | ✅ |
| GET /accounts (own) | ✅ | ❌ | ❌ | ❌ |
| GET /accounts/all | ❌ | ✅ | ✅ | ✅ |
| POST /accounts/deposit | ✅ | ✅ | ❌ | ✅ |
| POST /accounts/withdraw | ✅ | ✅ | ❌ | ✅ |
| POST /accounts/airdrop | ❌ | ❌ | ❌ | ✅ |
| **Transactions** | | | | |
| POST /transactions/transfer | ✅ | ✅ | ❌ | ❌ |
| GET /transactions/account/:number | ✅ | ✅ | ✅ | ✅ |
| GET /transactions/all | ❌ | ✅ | ✅ | ✅ |
| GET /transactions/:id (unmasked) | ❌ | ❌ | ✅ | ✅ |
| **Users** | | | | |
| GET /users/me | ✅ | ✅ | ✅ | ✅ |
| PUT /users/me | ✅ | ✅ | ✅ | ✅ |
| GET /users/customers | ❌ | ✅ | ✅ | ✅ |
| GET /users/staff | ❌ | ❌ | ✅ | ✅ |
| GET /users/:id (detail) | ❌ | ❌ | ✅ | ✅ |
| **Admin** | | | | |
| POST /admin/create-staff | ❌ | ❌ | ❌ | ✅ |
| PUT /admin/staff/:staffId | ❌ | ❌ | ❌ | ✅ |
| DELETE /admin/staff/:staffId | ❌ | ❌ | ❌ | ✅ |
| PUT /admin/customer/:customerId | ❌ | ❌ | ❌ | ✅ |
| DELETE /admin/customer/:customerId | ❌ | ❌ | ❌ | ✅ |
| **Audit** | | | | |
| GET /audit/me | ✅ | ✅ | ✅ | ✅ |
| GET /audit/user/:userId | ❌ | ✅ | ✅ | ✅ |
| GET /audit/all | ❌ | ❌ | ✅ | ✅ |
| **Expenses** | | | | |
| POST /expenses | ✅ | ❌ | ❌ | ✅ |
| GET /expenses (own) | ✅ | ❌ | ❌ | ❌ |
| GET /expenses (all) | ❌ | ❌ | ✅ | ✅ |
| PUT/DELETE /expenses/:id | ✅ | ❌ | ❌ | ✅ |
| **AI** | | | | |
| POST /ai/chat | ✅ | ❌ | ❌ | ❌ |
| GET /ai/insights | ✅ | ❌ | ❌ | ✅ |
| **Dashboard** | | | | |
| GET /dashboard | ❌ | ✅ | ✅ | ✅ |
| **Admin Portal UI — Sidebar Nav** | | | | |
| Dashboard | — | ✅ | ✅ | ✅ |
| User Management | — | ✅ | ✅ | ✅ |
| Staff Management | — | ❌ | ❌ | ✅ |
| Account Management | — | ✅ | ✅ | ✅ |
| Applications (Pending) | — | ✅ | ✅ | ✅ |
| System Audit Logs | — | ❌ | ✅ | ✅ |
| Transaction History | — | ✅ | ✅ | ✅ |
| Airdrop Management | — | ❌ | ❌ | ✅ |

## Sensitive Data Exposure Matrix

*The RBAC Matrix covers endpoint access and UI navigation. This table defines strict rules for field-level visibility and widget accessibility.*

| Data/Field | Banker | Auditor | Admin |
| :--- | :---: | :---: | :---: |
| `counts.staff` (Dashboard) | ❌ | ✅ | ✅ |
| Transaction Details (Unmasked) | ❌ | ✅ | ✅ |
| Staff Profile (`phoneNumber`, `staffId`) | ❌ | ✅ | ✅ |
| Full Audit Logs | ❌ | ✅ | ✅ |
| Dashboard KPI: Staff Members | ❌ | ✅ | ✅ |

*Legend: ✅ = Visible/Accessible | ❌ = Hidden/Masked/Forbidden*

---

## Authorization Logic (Code Patterns)

### Pattern 1: Role-Based Check

**Example: Admin only**

```javascript
router.post("/create-staff", authorizeRoles("admin"), controller.createStaff);
```

---

### Pattern 2: Ownership Check (Customer)

**Example: Customer can only view own accounts**

```javascript
exports.getAccounts = async (req, res) => {
  if (req.user.role === "customer") {
    const accounts = await Account.find({ user: req.user.id });
  } else {
    const accounts = await Account.find();
  }
  return success(res, { data: accounts });
};
```

---

### Pattern 3: Read-Only Role Guard (Auditor)

**Example: Auditor can read but never mutate**

```javascript
// In service — auditor reaches this point via authorizeRoles("auditor", "admin")
// No mutation methods (save/update/delete) are ever called for auditor paths
exports.getTransactionDetails = async (req, res) => {
  const unmasked = ["auditor", "admin"].includes(req.user.role);
  const txn = await transactionService.getById(req.params.id, { unmasked });
  return success(res, { data: txn });
};
```

---

## Scoping by Role

### Customer Scope

- ✅ Own profile, own accounts, own transactions, own expenses
- ❌ Cannot view other users' data
- ❌ Cannot approve applications or manage staff

### Banker Scope

- ✅ Deposit/withdraw/transfer on any account
- ✅ Approve and verify customer onboarding applications
- ✅ View all accounts, all transactions, all customers
- ✅ View activity log for specific users
- ❌ Cannot see full unmasked transaction detail (auditor/admin only)
- ❌ Cannot manage staff (admin only)
- ❌ Cannot view full audit log across all users

### Auditor Scope

- ✅ Read-only access to everything — all transactions (unmasked), all audit logs, all users
- ✅ Can investigate any account or staff action
- ❌ **Zero mutations** — cannot deposit, transfer, approve, create, update, or delete anything
- Key CIA principle: auditor sees all but changes nothing — cannot cover tracks

### Admin Scope

- ✅ Staff management — create, update role/status, delete
- ✅ Customer management — update status, delete
- ✅ Full audit log access
- ✅ Airdrop (testing/demo)
- ❌ Cannot run customer transactions (transfer/deposit/withdraw) — by design
- Note: Admin is IT/system admin, not a branch manager. Transaction power belongs to `banker`.

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

Every HIGH-severity action is logged via `activityLogger` middleware before the controller runs:

```javascript
router.post(
  "/approve/:userId",
  authorizeRoles("admin", "banker"),
  activityLogger("APPROVE_APPLICATION", "Staff approved initial application"),
  approveApplication,
);
```

---

## Future: Fine-Grained Permissions (Phase 8+)

When role expansion is implemented (Phase 8), `authorizeRoles()` calls across all routes will be updated to include `"auditor"` on all read-only endpoints. No new middleware pattern is needed — `authorizeRoles` already accepts multiple roles as args.

Further future (not planned): resource-level permissions per staff member (e.g., banker assigned to specific branch).

---

## Sensitive Data Exposure Matrix

| Data/Field | Banker | Auditor | Admin |
| :--- | :---: | :---: | :---: |
| `counts.staff` (Dashboard) | ❌ | ✅ | ✅ |
| Transaction Details (Unmasked) | ❌ | ✅ | ✅ |
| Staff Profile (`phoneNumber`, `staffId`) | ❌ | ✅ | ✅ |
| Full Audit Logs | ❌ | ✅ | ✅ |
| Transaction History (All) | ✅ | ✅ | ✅ |

*Legend: ✅ = Visible/Accessible | ❌ = Hidden/Masked/Forbidden*

---

**Last Updated:** Jun 10, 2026
