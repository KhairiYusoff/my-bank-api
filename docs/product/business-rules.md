# MyBank — Business Rules

> This is the source of truth for all business logic decisions. Code must conform to this document, not the other way around.

**Last Updated:** Jun 12, 2026

---

## 1. Account Types

### 1.1 Supported Types

| Type               | Code            | Purpose                                |
| ------------------ | --------------- | -------------------------------------- |
| Savings            | `savings`       | Personal savings, earns interest       |
| Current / Checking | `current`       | Daily transactions, overdraft eligible |
| Business           | `business`      | Company accounts, higher limits        |
| Fixed Deposit      | `fixed_deposit` | Lock money for guaranteed returns      |

### 1.2 Rules Per Type

| Rule                   | Savings   | Current                   | Business                  | Fixed Deposit           |
| ---------------------- | --------- | ------------------------- | ------------------------- | ----------------------- |
| Min opening balance    | RM20      | RM20                      | RM500                     | RM1,000                 |
| Min maintained balance | RM1       | RM0                       | RM500                     | RM1,000 (locked)        |
| Daily transfer limit   | RM10,000  | RM20,000                  | RM50,000                  | ❌ No transfers         |
| Max single transfer    | RM5,000   | RM10,000                  | RM20,000                  | ❌ No transfers         |
| Withdrawal limit       | Unlimited | Unlimited                 | Unlimited                 | Only at maturity        |
| Overdraft              | ❌ No     | ✅ Up to banker-set limit | ✅ Up to banker-set limit | ❌ No                   |
| Interest               | ✅ Yes    | ❌ No                     | ❌ No                     | ✅ Yes (higher rate)    |
| Dormancy applies       | ✅ Yes    | ✅ Yes                    | ✅ Yes                    | ❌ Governed by maturity |

### 1.3 Fixed Deposit Rules

- Lock periods: 1 / 3 / 6 / 12 months (customer selects on creation)
- Maturity date auto-calculated: `dateOpened + lockPeriod`
- Interest credited on maturity (not monthly)
- Early withdrawal: allowed but **forfeits all interest** (principal returned only)
- Auto-renewal: if customer does not withdraw within 7 days of maturity, FD auto-renews for same period at current rate
- No transfers in or out during lock period

### 1.4 Overdraft Rules

- Only Current and Business accounts
- Limit set by banker at account level (default: RM0 until banker sets it)
- Overdraft balance incurs no interest in MVP (future: charge interest on negative balance)
- Account cannot go below `-overdraftLimit`

### 1.5 Account Number Format

All **new** accounts created from Phase 9 onward use a fixed 13-digit format, following MyBank standards:

```
{PPP}{BBB}{SSSSSS}{C}
```

| Segment | Length | Description |
| ------- | ------ | ----------- |
| `PPP`   | 3      | Product Code (e.g., 100 for Savings, 300 for Current) |
| `BBB`   | 3      | Branch Code (e.g., 514 for KL Main, 512 for PJ) |
| `SSSSSS`| 6      | Obfuscated sequence number (unique per branch/product) |
| `C`     | 1      | Checksum digit (Luhn algorithm) |

**Product codes (`PPP`)**:

| Account type     | Code | Example            |
| ---------------- | ---- | ------------------ |
| `savings`        | `100` | `1005142345674`    |
| `current`        | `300` | `3005142345675`    |
| `business`       | `500` | `5005142345678`    |
| `fixed_deposit`  | `700` | `7005142345672`    |

**Assignment rules**:

| Provisioning path | When `accountNumber` is assigned |
| ----------------- | -------------------------------- |
| Onboarding (savings) | At customer verification — account is `active` immediately |
| `POST /accounts/request` (current / business / FD) | At request time — account is `pending_approval` |
| Banker `POST /accounts/create` | At creation |
| `approveAccountRequest` | **Never** — approval activates the same document; number does not change |

**Generation**: `shared/utils/generateAccountNumber.js` — uses branch-specific atomic Counters, obfuscates the sequence to prevent enumeration, and appends a Luhn checksum for data integrity.

**Legacy format (pre-Phase 9)**: `MYB{timestamp}` (e.g. `MYB1776836236910`). Existing records are valid and are not migrated.

**Masking (customer-facing API responses)**: Account numbers are masked as `{first 3 chars}****{last 4 chars}` — e.g. `1005142345674` → `100****5674`. Staff roles (`banker`, `admin`, `auditor`) receive the full unmasked value. Format length is fixed at 13 digits.

---

## 2. Transaction Limits

### 2.1 Transfer Limits (enforced in `transferFunds` service)

| Check                | Rule                                                                  |
| -------------------- | --------------------------------------------------------------------- |
| Min amount           | RM1.00                                                                |
| Max single transfer  | Per account type (table above)                                        |
| Daily cumulative cap | Per account type (table above) — sum of all transfers in calendar day |
| Balance check        | `balance + overdraftLimit >= amount`                                  |
| FD restriction       | FD accounts cannot send or receive transfers                          |
| Self-transfer        | Blocked — cannot transfer to same account number                      |

### 2.2 Deposit Limits

| Check              | Rule                                                |
| ------------------ | --------------------------------------------------- |
| Min deposit        | RM10.00                                             |
| Max single deposit | RM100,000 (flag for AML review above this — future) |
| FD deposit         | Only on account creation (initial principal)        |

### 2.3 Withdrawal Limits

| Check           | Rule                                  |
| --------------- | ------------------------------------- |
| Min withdrawal  | RM10.00                               |
| FD withdrawal   | Only at or after maturity date        |
| Dormant account | Withdrawals blocked until reactivated |

---

## 3. Interest Rates

### 3.1 Savings Interest (p.a.)

| Balance Tier        | Annual Rate |
| ------------------- | ----------- |
| RM0 – RM9,999       | 0.50%       |
| RM10,000 – RM49,999 | 1.00%       |
| RM50,000+           | 1.50%       |

- Calculated daily on end-of-day balance, credited monthly on the last day of the month
- Cron job: runs at 23:59 on last day of each month
- Minimum balance to earn interest: RM1

### 3.2 Fixed Deposit Interest (p.a.)

| Lock Period | Rate  |
| ----------- | ----- |
| 1 month     | 2.50% |
| 3 months    | 2.80% |
| 6 months    | 3.10% |
| 12 months   | 3.50% |

- Interest = `principal × rate × (lockPeriod / 12)`
- Credited to linked Savings/Current account on maturity (not to FD itself)
- Early withdrawal: principal returned to source account, zero interest

---

## 4. Fee Structure

### 4.1 Transaction Fees

| Transaction         | Fee    | Notes                                     |
| ------------------- | ------ | ----------------------------------------- |
| Same-bank transfer  | RM0.00 | All transfers within MyBank are free      |
| Deposit             | RM0.00 | Always free                               |
| Withdrawal          | RM0.00 | Always free                               |
| FD early withdrawal | RM0.00 | Penalty is interest forfeiture, not a fee |

### 4.2 Account Fees

| Fee                            | Amount          | Trigger                                    |
| ------------------------------ | --------------- | ------------------------------------------ |
| Monthly maintenance — Savings  | RM5.00 / month  | If average monthly balance < RM1,000       |
| Monthly maintenance — Current  | RM8.00 / month  | If average monthly balance < RM2,000       |
| Monthly maintenance — Business | RM15.00 / month | If average monthly balance < RM5,000       |
| Monthly maintenance — FD       | RM0.00          | Never charged                              |
| Dormancy fee                   | RM10.00 / year  | Charged on anniversary of dormancy trigger |
| Early account closure          | RM20.00         | Account closed within 3 months of opening  |

- Maintenance fees deducted on the 1st of each month via cron
- If balance insufficient to cover fee: fee is waived that month, account flagged
- Fee transactions appear in transaction history as `type: fee`

---

## 5. Account Lifecycle Rules

### 5.1 Status Flow

```
pending_approval → active → dormant → suspended → closed
                     ↑          ↓
                     └──────────┘ (reactivation by banker)
```

| Status             | Trigger                                 | Customer can:      | Transactions:                |
| ------------------ | --------------------------------------- | ------------------ | ---------------------------- |
| `pending_approval` | Account creation                        | View only          | None                         |
| `active`           | Banker approves                         | Full access        | All allowed                  |
| `dormant`          | No activity for 12 months (cron)        | View only          | None — reactivation required |
| `suspended`        | Admin/banker action                     | View only          | None                         |
| `closed`           | Zero balance + closure request approved | Hidden from portal | None                         |

### 5.2 Dormancy Rules

- Trigger: no debit or credit transactions for 12 consecutive months
- Cron: runs daily at 02:00, checks all `active` accounts
- Balance preserved — dormancy does not affect funds
- Reactivation: banker action required (`PUT /accounts/:accountNumber/reactivate`)
- Dormancy fee: RM10/year charged on anniversary of dormancy date

### 5.3 Account Closure Rules

- Customer requests closure → status set to `pending_closure`
- Banker reviews and approves → status set to `closed`
- Pre-conditions: balance must be RM0, no pending transactions
- FD accounts: must be at or past maturity date
- Closed accounts: hidden from customer portal, preserved in DB for audit

### 5.4 Account Provisioning Rules

- **Default Provisioning:** Only `savings` accounts are created automatically upon successful customer onboarding.
- **Product Requests:** Customers must request `current`, `business`, or `fixed_deposit` accounts via the portal.
- **Provisioning Workflow:**
  1. Customer submits account request (POST `/accounts/request`).
  2. Request created with status `pending_approval`.
  3. Banker reviews request via Admin Portal.
  4. Banker approves → Account is created (Status: `active`).
- **Validation:** All account types must pass product-specific validation (min balance, KYC level, documentation) before approval.

---

## 6. User Roles & Access Control

### 6.1 Role Definitions

| Role         | Platform               | Permissions                                                       | Mutation Allowed    |
| ------------ | ---------------------- | ----------------------------------------------------------------- | ------------------- |
| **Customer** | `my-bank-customer`     | Own accounts, own transactions, own expenses                      | ✅ Own only         |
| **Banker**   | `my-bank-admin-portal` | Manage applications, any account transactions, view basic audit   | ✅ All except staff |
| **Auditor**  | `my-bank-admin-portal` | Read-only access to all data, unmasked details, full system audit | ❌ None             |
| **Admin**    | `my-bank-admin-portal` | Full system access, staff management, airdrop, system config      | ✅ Full             |

### 6.2 Auditor Specific Rules

- **Zero-Mutation Policy**: The auditor role is strictly read-only. API calls using `POST`, `PUT`, `PATCH`, or `DELETE` must return `403 Forbidden` if they affect banking data, applications, or user status.
- **Unmasked Data Access**: Auditors are granted the privilege to see full, unmasked transaction details (e.g., full counterpart names and account numbers) for investigation purposes.
- **Full Audit Visibility**: Auditors can view the entire system's activity log, including actions performed by `Admin` and `Banker` roles.
- **Separation of Duties**: Auditors cannot create or approve applications they might later audit, ensuring no conflict of interest.

---

## 7. Reference Number Format

All transactions get a human-readable reference at write time:

```
TXN-YYYYMMDD-XXXXX
```

- `YYYYMMDD` = transaction date
- `XXXXX` = 5-digit zero-padded sequence per day (resets at midnight)
- Example: `TXN-20260529-00142`
- Must be **unique** — enforced via unique index on `reference` field
- Sequence stored in a `Counter` collection, incremented atomically

---

## 8. Beneficiary Management

- Customer can save up to 20 beneficiaries
- Beneficiary = `{ nickname, accountNumber, bankName (always "MyBank" for now) }`
- Stored in `User` model as embedded array (not a separate collection — low volume)
- No verification on add — transfer will fail at execution if account doesn't exist

---

## 9. Statement Rules

- Monthly statement = all transactions for a given calendar month on a given account
- Includes: opening balance, closing balance, total credits, total debits, transaction list
- Available via: `GET /accounts/:accountNumber/statement?month=5&year=2026`
- Data retention: all months since account opening
- PDF generation: Phase 2 of statements feature

---

## 10. AI Chat Rules

- Chat history persists in **Redux store** only — survives page navigation, cleared on logout/refresh
- AI responses must never include generic disclaimers like "this is not financial advice" unprompted
- AI has access to: user's account balances, transaction history, expense categories (read-only, injected as context)
- AI must not execute transactions — read-only financial context only
- AI responses must be specific to the user's actual data, not generic
- Guardrails: no investment advice, no tax advice, no legal advice — but respond naturally without the disclaimer unless specifically asked about those topics
