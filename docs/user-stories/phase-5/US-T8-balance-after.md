# US-T8 — Balance After Transaction

**Phase:** 5
**Epic:** Transaction Detail Enrichment
**Status:** 📝 Ready for Development
**Story Points:** 2

---

## Value Statement

As a customer, I want to see my account balance immediately after each transaction so that I can track my running balance and spot discrepancies without doing mental arithmetic.

---

## Background

Currently, the transaction history shows amount and direction but not the resulting balance. To verify their balance at any point in time, customers have to add and subtract manually. Real banking apps (Maybank2u, CIMB Clicks) always show a running balance column. This also helps with dispute resolution — a customer can immediately see if a transaction caused an unexpected balance drop.

---

## Acceptance Criteria

### 1. Schema

1. `balanceAfter` field added to `Transaction` model: `Number`, default `null`
2. Stored at **write time** — captured from the account's `balance` field immediately after the balance update within the same atomic session
3. Never recomputed on read — the stored snapshot is the source of truth

### 2. Write-time capture

1. In `transferFunds` (my-bank-api):
   - Debit record: `balanceAfter` = sender's balance after deduction
   - Credit record: `balanceAfter` = recipient's balance after addition
2. In `deposit` service: `balanceAfter` = account balance after deposit
3. In `withdraw` service: `balanceAfter` = account balance after withdrawal
4. In `airdrop` service: `balanceAfter` = account balance after airdrop
5. In fee transactions (Phase 6): `balanceAfter` = account balance after fee deduction

### 3. Atomicity guarantee

1. The balance update and the `balanceAfter` capture happen inside the same MongoDB session (already in place for `transferFunds`)
2. If the session aborts, neither the balance change nor the `balanceAfter` is persisted

### 4. API responses

1. `balanceAfter` included in all transaction list and detail responses
2. Precision: 2 decimal places — stored as a number, formatted as `RM X,XXX.XX` in the UI

### 5. Display — Customer portal (transaction list)

1. `balanceAfter` shown as a right-aligned column in the transaction list: `"Balance: RM2,450.00"`
2. Column header: `"Balance After"`
3. If `balanceAfter` is null (old transaction): show `"—"` in that column

### 6. Display — Receipt (US-T5)

1. Shown as: `"Balance after  RM2,450.00"` in the receipt field list
2. If null: omit the row entirely (receipt is cleaner without a `"—"` row)

### 7. Display — Admin portal

1. `balanceAfter` shown in the transaction detail panel
2. Also available as a column in the admin transactions list (hidden by default, column toggle)

### 8. Old transactions (pre-Phase-5)

1. `balanceAfter: null` is expected and not an error
2. Display as `"—"` in list, omit row in receipt

---

## Sub-tasks

| # | Task | Layer |
| --- | --- | --- |
| T8-BE1 | Add `balanceAfter` field (`Number`, default `null`) to `Transaction` model | BE |
| T8-BE2 | Capture `balanceAfter` in `transferFunds` for both debit and credit records | BE |
| T8-BE3 | Capture `balanceAfter` in `deposit`, `withdraw`, and `airdrop` in `account.service.js` | BE |
| T8-BE4 | Include `balanceAfter` in all transaction API responses (list + detail) | BE |
| T8-FE1 | Add "Balance After" column to customer transaction list | FE (customer) |
| T8-FE2 | Show `balanceAfter` on receipt component (US-T5) | FE (customer) |
| T8-FE3 | Show `balanceAfter` in admin transaction detail panel | FE (admin) |

---

## Related Stories

- **US-T5** — Receipt (displays `balanceAfter`)
- **US-T6** — Reference number (same write-time enrichment pass)
- **US-T7** — Counterpart visibility (same write-time enrichment pass)

> All four Phase 5 stories touch the same write path. T8-BE2 and T8-BE3 should be done in the same commit as T6-BE3 and T7-BE4 to avoid touching `transferFunds` and `account.service.js` multiple times.
