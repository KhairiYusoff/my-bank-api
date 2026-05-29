# US-T7 — Counterpart Visibility on Transfers

**Phase:** 5
**Epic:** Transaction Detail Enrichment
**Status:** 📝 Ready for Development
**Story Points:** 3

---

## Value Statement

As a customer, I want to see who I sent money to and who sent me money on every transfer transaction so that I can identify transfers without ambiguity.

---

## Background

The Phase 1 refactor replaced the `fromAccountNumber`/`toAccountNumber` string fields with a single `account: ObjectId` ref. This lost all counterpart information. A customer now sees `"Transfer — RM500"` with no recipient info — they cannot tell which of their transfers went to which person. This is both a UX failure and a dispute risk.

The fix: at write time (when the transfer executes), capture the counterpart's account number and their masked name into both transaction records.

---

## Acceptance Criteria

### 1. Counterpart fields on the Transaction model

1. `counterpartAccount` — `String` — the account number of the other party
2. `counterpartName` — `String` — masked display name of the other party (see masking rules below)
3. Both fields populated at write time in `transferFunds` service, for **both** the debit and credit transaction records

### 2. Masking rules (customer-facing)

Masking is applied at the service layer before storing — the stored value is already masked:

| Scenario | Stored as |
| --- | --- |
| First name "Ahmad", last name "Khalid" | `Ahmad K****` |
| First name "Siti", last name "Rahayu" | `Siti R****` |
| Single name only (e.g. "Salmah") | `S****` |
| Name has 2+ words — mask all except first word + first char of second word | As above |

**Rule:** Keep first word in full. Take first character of second word, append `****`. Ignore middle names.

3. Admin/banker role receives the **unmasked** full name — this is applied at the API response layer (not stored separately)
4. `counterpartAccount` stored as-is (full account number) — masking applied at API response layer:
   - Customer role: `MYB****5236` (first 3 chars + `****` + last 4 chars)
   - Admin/banker role: full account number

### 3. What goes in each transaction record

When Customer A (account `MYB-001`) transfers RM500 to Customer B (account `MYB-002`):

**Debit record (A's transaction — "money left"):**

```
account:             MYB-001 (ObjectId)
type:                transfer
amount:              500
counterpartAccount:  MYB-002
counterpartName:     "Siti R****"   ← masked name of B
```

**Credit record (B's transaction — "money arrived"):**

```
account:             MYB-002 (ObjectId)
type:                transfer
amount:              500
counterpartAccount:  MYB-001
counterpartName:     "Ahmad K****"  ← masked name of A
```

### 4. Direction label in UI

1. If it is a debit transaction (money left account): label = `"You sent to"`
2. If it is a credit transaction (money arrived): label = `"You received from"`
3. Direction is determined by comparing `account._id` with the logged-in user's account — or by a `direction` flag in the API response (`sent` / `received`)

### 5. Deposits and withdrawals

1. `counterpartName` = `"MyBank"` for all deposit, withdrawal, airdrop, and fee transactions
2. `counterpartAccount` = `null` for these types — do not show an account number

### 6. Old transactions (pre-Phase-5)

1. `counterpartName: null` → display as `"—"`
2. `counterpartAccount: null` → omit the account number row entirely

### 7. API response

1. Customer role: receives masked `counterpartName` (already masked in DB) and masked `counterpartAccount` (masked at response layer)
2. Admin/banker role: receives unmasked full name (looked up at response time from User model) and full `counterpartAccount`
3. Both fields included in list response AND detail response

---

## Sub-tasks

| # | Task | Layer |
| --- | --- | --- |
| T7-BE1 | Add `counterpartAccount` and `counterpartName` fields to `Transaction` model | BE |
| T7-BE2 | Write `maskName(fullName)` utility in `shared/utils/` | BE |
| T7-BE3 | Write `maskAccountNumber(accountNumber)` utility in `shared/utils/` | BE |
| T7-BE4 | In `transferFunds`: look up counterpart user name, apply `maskName`, populate both fields on both records | BE |
| T7-BE5 | In API responses: admin/banker role receives unmasked name (User lookup) + unmasked account | BE |
| T7-FE1 | Transaction list — show counterpart name as secondary line on transfer rows | FE (customer) |
| T7-FE2 | Receipt — show direction label ("You sent to" / "You received from") + counterpart name + masked account | FE (customer) |
| T7-FE3 | Admin receipt — show unmasked name + full account number | FE (admin) |

---

## Related Stories

- **US-T5** — Receipt (displays counterpart info)
- **US-T6** — Reference number (same write-time enrichment pass)
- **US-T8** — Balance after (same write-time enrichment pass)
