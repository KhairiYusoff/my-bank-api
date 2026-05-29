# MyBank — Requirements

Acceptance criteria per module. Ticked = built and verified. See `business-rules.md` for business logic decisions.

**Last Updated:** May 29, 2026

---

## Functional Requirements

### F1: Authentication (Module: `auth`)

**Requirement:** Users can securely log in and out with JWT tokens.

**Acceptance Criteria:**

- [x] User can log in with email + password
- [x] JWT token issued on login, stored in httpOnly cookie (secure, same-site)
- [x] `check-token` endpoint verifies token on app init
- [x] Token expiry enforced (7 days default)
- [x] User can log out (cookie cleared)
- [x] Invalid login attempt logs activity (AuditLog)
- [x] Successful login logs activity (AuditLog)
- [ ] Password reset via email (UI wired, email send TBD)

---

### F2: Onboarding (Module: `onboarding`)

**Requirement:** New customers can apply and be verified by admins.

**Acceptance Criteria:**

- [x] Customer submits application: email, name, ID number, address, phone
- [x] Application stored with status `pending_verification`
- [x] Admin can approve or reject applications
- [x] Approval automatically creates a default account
- [x] Rejection sends notification with reason
- [x] Customer can complete profile (phone, address) post-approval
- [x] Profile completion triggers notification
- [x] All state changes logged (AuditLog)

---

### F3: Accounts (Module: `accounts`)

**Requirement:** Customers and bankers can manage accounts.

**Acceptance Criteria:**

- [x] Banker creates account for customer (accountNumber auto-generated)
- [x] Customer can view all their accounts
- [x] Admin/banker can view any account
- [x] Account has: user, accountNumber, accountType, branch, balance, currency, status, dateOpened
- [x] Account statuses: active, dormant, suspended, closed
- [x] Deposit: Banker deposits to any account — atomic transaction + balance update
- [x] Withdraw: Customer withdraws from own account — atomic transaction + balance update
- [x] Deposit/withdraw sends notification (non-blocking)
- [x] Deposit/withdraw logged (AuditLog)
- [x] Airdrop: Admin only, adds money to any account
- [x] Airdrop logged (AuditLog)
- [ ] **Phase 6:** Enforce account-type rules — daily limit, single transfer cap, withdrawal caps per type
- [ ] **Phase 6:** Overdraft enforcement — Current/Business can go negative up to banker-set limit
- [ ] **Phase 6:** Savings monthly withdrawal counter enforced (max 4/month)
- [ ] **Phase 6:** Monthly maintenance fee cron (deduct on 1st of month)
- [ ] **Phase 6:** Savings interest cron (credit on last day of month)
- [ ] **Phase 8:** Dormancy cron — mark accounts dormant after 12 months no activity

---

### F4: Transactions (Module: `transactions`)

**Requirement:** Customers can transfer money between accounts and view full-detail history.

**Acceptance Criteria:**

- [x] Transfer: Customer transfers from own account to any other account
- [x] Transfer creates 2 atomic transaction records (debit + credit)
- [x] Transfer updates both account balances atomically (all-or-nothing, MongoDB session)
- [x] Insufficient funds check prevents negative balances
- [x] Transfer sends notifications to both parties (non-blocking)
- [x] Transfer logged (AuditLog)
- [x] Customer can view transaction history (paginated, 10/page default)
- [x] Admin can view all transactions
- [ ] **Phase 5:** Each transaction gets a reference number (`TXN-YYYYMMDD-XXXXX`)
- [ ] **Phase 5:** Transfer transactions store `counterpartAccount` + `counterpartName`
- [ ] **Phase 5:** All transactions store `balanceAfter` (account balance post-transaction)
- [ ] **Phase 5:** Transactions store `fee` (default 0, reserved for future fee engine)
- [ ] **Phase 5:** Transactions store `category` (auto-derived from type)
- [ ] **Phase 5:** Transactions store `processingTime.submittedAt` + `processingTime.completedAt`
- [ ] **Phase 5:** Transaction detail view meaningfully differs from list (shows reference, counterpart, balance after)

---

### F5: Admin Functions (Module: `admin`)

**Requirement:** Admins can manage applications, users, and staff.

**Acceptance Criteria:**

- [x] Admin views pending applications
- [x] Admin can approve or reject each application
- [x] Approval auto-creates account + sends notification
- [x] Admin can view all users (paginated)
- [x] Admin can update customer status and details
- [x] Admin can delete customer account
- [x] Admin can perform airdrops
- [x] Admin can create banker accounts
- [x] Admin can update staff details and role
- [x] Admin can delete staff account
- [x] All admin actions logged (AuditLog)

---

### F6: Audit Logging (Module: `audit`)

**Requirement:** All HIGH-severity actions are logged for compliance.

**Acceptance Criteria:**

- [x] ActivityLog stores: action, userId, targetUser, timestamp, ip, userAgent, status, metadata
- [x] HIGH-severity actions logged: LOGIN, LOGIN_FAILED, LOGOUT, DEPOSIT, WITHDRAW, AIRDROP, TRANSFER, ACCOUNT_CREATION, CUSTOMER_APPLICATION, CUSTOMER_REGISTRATION, PROFILE_UPDATED
- [x] Admin can view activity logs (paginated, filterable by action/user)
- [x] Log entries immutable (no updates, only inserts)
- [x] Logs include IP + user agent

---

### F7: Expenses (Module: `expenses`)

**Requirement:** Customers can track and categorize expenses.

**Acceptance Criteria:**

- [x] Customer can create expense: amount, category, date, notes
- [x] Categories: Food, Transport, Entertainment, Shopping, Utilities, Medical, Other
- [x] Customer can view expense history (paginated)
- [x] Customer can update expense
- [x] Customer can delete expense
- [x] Expenses do NOT affect account balance (separate tracking)
- [x] Monthly analytics by category
- [x] Yearly analytics

---

### F8: Users (Module: `users`)

**Requirement:** User profiles can be managed.

**Acceptance Criteria:**

- [x] Customer can view own profile: name, email, phone, address
- [x] Customer can update own profile (phone, address)
- [x] Admin can view any user's profile
- [x] Admin can update user status and role
- [x] All profile changes logged (AuditLog)

---

### F9: Fixed Deposit (Module: `fixed_deposit`) — Phase 7

- [ ] FD account creation with chosen lock period (1/3/6/12 months) and principal amount
- [ ] Maturity date auto-calculated on creation
- [ ] FD account cannot send or receive transfers
- [ ] Interest calculated at maturity: `principal × rate × (lockPeriod / 12)`
- [ ] Maturity cron: runs daily, credits interest to linked account on maturity date
- [ ] Early withdrawal: principal returned, zero interest, type `fd_early_withdrawal`
- [ ] Auto-renewal: if no action within 7 days of maturity, renew at current rate
- [ ] FD maturity notification sent 7 days before and on maturity date

---

### F10: Account Lifecycle — Phase 8

- [ ] Dormancy cron: daily at 02:00, marks accounts dormant after 12 months no activity
- [ ] Dormant accounts: all transactions blocked
- [ ] Banker can reactivate dormant account
- [ ] Dormancy fee cron: RM10/year on dormancy anniversary
- [ ] Admin can suspend accounts
- [ ] Suspension blocks all transactions
- [ ] Account closure: customer requests, banker approves, requires zero balance
- [ ] Closed accounts hidden from customer portal, preserved in DB

---

### F11: Statements (Module: `statements`) — Phase 9

- [ ] `GET /accounts/:accountNumber/statement?month=5&year=2026` returns: opening balance, closing balance, total credits, total debits, transaction list
- [ ] Statement endpoint respects account ownership — customer can only view own accounts
- [ ] Admin/banker can view statement for any account
- [ ] PDF generation endpoint (Phase 9B)

---

### F12: Beneficiaries (Module: `beneficiaries`) — Phase 10

- [ ] Customer can save up to 20 beneficiaries (nickname + accountNumber)
- [ ] Beneficiaries stored as embedded array on User model
- [ ] Customer can add, update, delete beneficiaries
- [ ] Transfer form pre-fills account number when beneficiary selected
- [ ] No verification on add — transfer fails at execution if account invalid

---

### F13: AI Assistant (Module: `ai`) — Phase 11

- [ ] `POST /ai/chat` wired in customer portal
- [ ] Chat history persists in Redux (survives navigation, cleared on logout/refresh)
- [ ] AI response uses real account + transaction data as context
- [ ] AI responses specific to user — not generic
- [ ] No unprompted generic disclaimers ("this is not financial advice")
- [ ] Phase 12: Proactive nudges, spend insights, agentic advisor

---

## Non-Functional Requirements

| Requirement           | Target                                 | Measurement    |
| --------------------- | -------------------------------------- | -------------- |
| **API Response Time** | < 500ms for 95th percentile            | Server logs    |
| **Page Load Time**    | < 2s (cached)                          | Lighthouse     |
| **Uptime**            | 99.5%                                  | Vercel SLA     |
| **Security**          | No SQL injection, XSS, CSRF            | OWASP Top 10   |
| **Authentication**    | JWT + httpOnly (no localStorage)       | Code review    |
| **Authorization**     | Role-based (customer, banker, admin)   | RBAC matrix    |
| **Audit Trail**       | 100% of HIGH-severity actions          | AuditLog count |
| **Atomicity**         | All money ops atomic (MongoDB session) | Test suite     |
| **Mobile**            | Responsive at 375px+                   | Device testing |

---

## Out of Scope (Won't Build)

- ❌ Real payment gateway (Stripe/Razorpay)
- ❌ Real KYC verification (Jumio etc.)
- ❌ Two-factor authentication
- ❌ Mobile app (web-responsive only)
- ❌ Interbank transfers (FPX, IBG, DuitNow)
- ❌ Credit scoring / loan products
- ❌ `DELETE /users/me` — banking apps do not allow self-deletion (compliance)

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
