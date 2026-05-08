# MyBank — Requirements

All features have been built. This document lists acceptance criteria per module for reference.

---

## Functional Requirements

### F1: Authentication (Module: `auth`)

**Requirement:** Users can securely log in and out with JWT tokens.

**Acceptance Criteria:**

- [ ] User can register with email + password (hashed via bcrypt)
- [ ] User can log in with email + password
- [ ] JWT token issued on login, stored in httpOnly cookie (secure, same-site)
- [ ] `check-token` endpoint verifies token on app init
- [ ] Token expiry enforced (7 days default)
- [ ] User can log out (cookie cleared)
- [ ] Invalid login attempt logs activity (AuditLog)
- [ ] Successful login logs activity (AuditLog)

---

### F2: Onboarding (Module: `onboarding`)

**Requirement:** New customers can apply and be verified by admins.

**Acceptance Criteria:**

- [ ] Customer submits application: email, name, ID number, address, phone
- [ ] Application stored with status `pending_verification`
- [ ] Admin can approve, reject, or request more info
- [ ] Approval automatically creates a default Checking account
- [ ] Rejection sends notification with reason
- [ ] Customer can complete profile (phone, address) post-approval
- [ ] Profile completion triggers notification
- [ ] All state changes logged (AuditLog: `CUSTOMER_APPLICATION`, `CUSTOMER_REGISTRATION`)

---

### F3: Accounts (Module: `accounts`)

**Requirement:** Customers and bankers can manage accounts.

**Acceptance Criteria:**

- [ ] Admin creates account for customer (accountNumber auto-generated)
- [ ] Customer can view all their accounts
- [ ] Admin/banker can view any account
- [ ] Account has: user, accountNumber, accountType, branch, balance, currency, status, dateOpened
- [ ] Account status: Active, Dormant, Closed (only Active = allow transactions)
- [ ] Customer can close account only if balance = 0
- [ ] Deposit: Banker deposits money to any account, customer deposits to own
- [ ] Withdraw: Customer withdraws from own account only, banker from any
- [ ] Deposit/withdraw creates atomic transaction record + updates balance
- [ ] Deposit/withdraw sends notification (non-blocking)
- [ ] All deposit/withdraw logged (AuditLog: `DEPOSIT`, `WITHDRAW`)
- [ ] Airdrop: Admin only, adds money to any account (testing/promo)
- [ ] Airdrop logged (AuditLog: `AIRDROP`)

---

### F4: Transactions (Module: `transactions`)

**Requirement:** Customers can transfer money between accounts and view history.

**Acceptance Criteria:**

- [ ] Transfer: Customer transfers from own account to any other account
- [ ] Transfer creates 2 atomic transaction records (from, to)
- [ ] Transfer updates both account balances atomically (all-or-nothing)
- [ ] Insufficient funds check prevents negative balances
- [ ] Transfer sends notifications to both parties (non-blocking)
- [ ] Transfer logged (AuditLog: `TRANSFER_INITIATED`, `TRANSACTION_COMPLETE`)
- [ ] Customer can view transaction history (paginated, 10/page default)
- [ ] Admin can view any account's transaction history
- [ ] Transactions show: date, amount, type, description, status, performedBy
- [ ] Pagination: page, limit, total, pages

---

### F5: Admin Functions (Module: `admin`)

**Requirement:** Admins can manage applications, users, and staff.

**Acceptance Criteria:**

- [ ] Admin views pending applications (status = `pending_verification`)
- [ ] Admin can approve, reject, or request info on each app
- [ ] Approval auto-creates account + sends notification
- [ ] Rejection sends notification with reason
- [ ] Admin can view all users (paginated)
- [ ] Admin can view all applications (approved, rejected, pending)
- [ ] Admin can perform airdrops (testing/promo)
- [ ] Admin can manage staff (create banker accounts, assign permissions)
- [ ] All admin actions logged (AuditLog: `HIGH` severity)

---

### F6: Audit Logging (Module: `audit`)

**Requirement:** All HIGH-severity actions are logged for compliance.

**Acceptance Criteria:**

- [ ] ActivityLog model stores: action, userId, targetUser, timestamp, ip, userAgent, status, metadata
- [ ] HIGH-severity actions logged: LOGIN, LOGIN_FAILED, LOGOUT, DEPOSIT, WITHDRAW, AIRDROP, TRANSFER, ACCOUNT_CREATION, ACCOUNT_CLOSURE, CUSTOMER_APPLICATION, CUSTOMER_REGISTRATION, PROFILE_UPDATED
- [ ] Admin can view activity logs (paginated, filterable by action/user)
- [ ] Each log entry immutable (no updates, only inserts)
- [ ] Logs include IP address + user agent (debugging, security)

---

### F7: Expenses (Module: `expenses`)

**Requirement:** Customers can track and categorize expenses.

**Acceptance Criteria:**

- [ ] Customer can create expense: amount, category, date, notes
- [ ] Categories: Food, Transport, Entertainment, Shopping, Utilities, Medical, Other
- [ ] Customer can view expense history (paginated)
- [ ] Customer can update expense (edit amount, category, date)
- [ ] Customer can delete expense
- [ ] Expenses do NOT affect account balance (separate tracking)
- [ ] Admin can view any user's expenses
- [ ] Expenses searchable by category + date range

---

### F8: Users (Module: `users`)

**Requirement:** User profiles can be managed.

**Acceptance Criteria:**

- [ ] Customer can view own profile: name, email, phone, address, ID number
- [ ] Customer can update own profile (phone, address)
- [ ] Customer can upload KYC documents (future)
- [ ] Admin can view any user's profile
- [ ] Admin can update user role (customer, banker, admin)
- [ ] User deletion: soft delete only (mark as inactive)
- [ ] All profile changes logged (AuditLog: `PROFILE_UPDATED`)

---

## Non-Functional Requirements

| Requirement             | Target                                 | Measurement                                                    |
| ----------------------- | -------------------------------------- | -------------------------------------------------------------- |
| **API Response Time**   | < 500ms for 95th percentile            | Server logs + monitoring                                       |
| **Page Load Time**      | < 2s (cached)                          | Vercel analytics                                               |
| **Time to Interactive** | < 3s                                   | Lighthouse audit                                               |
| **Uptime**              | 99.5%                                  | Vercel SLA                                                     |
| **Security**            | No SQL injection, XSS, CSRF            | OWASP Top 10 checklist                                         |
| **Authentication**      | JWT + httpOnly (no localStorage)       | Code review                                                    |
| **Authorization**       | Role-based (customer, banker, admin)   | RBAC matrix ([AUTHORIZATION.md](../SECURITY/AUTHORIZATION.md)) |
| **Audit Trail**         | 100% of HIGH-severity actions          | AuditLog collection count                                      |
| **Atomicity**           | All money ops atomic (MongoDB session) | Transaction test suite                                         |
| **Database**            | MongoDB M0 (512MB free) or higher      | Atlas dashboard                                                |
| **Scalability**         | Ready to migrate to MongoDB M2 ($9/mo) | No hardcoded limits                                            |
| **Browser Support**     | Chrome 90+, Safari 15+, Firefox 88+    | BrowserStack testing                                           |
| **Mobile**              | Responsive at 375px+                   | Device testing                                                 |
| **Accessibility**       | WCAG AA minimum                        | axe DevTools audit                                             |

---

## Success Metrics

- ✅ 0 runtime TypeScript errors
- ✅ All endpoints respond with correct status codes
- ✅ All money operations atomic (verified via MongoDB session logs)
- ✅ Audit trail captures 100% of HIGH-severity actions
- ✅ Authentication tokens expire correctly
- ✅ Authorization blocks unauthorized access (403)
- ✅ Notifications sent for all value-moving events
- ✅ No console errors in production build
- ✅ Responsive design verified at 375px, 768px, 1920px
- ✅ All forms validated client + server side
- ✅ Deployment to Vercel (api.mybank.app or similar)

---

## Out of Scope (Won't Build)

- ❌ Real payment gateway integration (Stripe/Razorpay)
- ❌ Real KYC verification (Jumio, etc.)
- ❌ Two-factor authentication
- ❌ Biometric login
- ❌ Mobile app (web-responsive only)
- ❌ API rate limiting (built in Phase 2)
- ❌ ML-based fraud detection (built in Phase 3 AI)
- ❌ Video KYC verification

---

**Last Updated:** May 8, 2026
