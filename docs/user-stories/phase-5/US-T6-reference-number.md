# US-T6 — Transaction Reference Number

**Phase:** 5
**Epic:** Transaction Detail Enrichment
**Status:** 📝 Ready for Development
**Story Points:** 3

---

## Value Statement

As a customer, I want every transaction to have a unique human-readable reference number so that I can quote it precisely when contacting support or disputing a transaction.

---

## Background

Currently transactions have no reference number. Customers cannot identify a specific transaction when speaking to support — they can only say "RM500 on 29 May" which is ambiguous if there are multiple transactions on the same day. A reference number like `TXN-20260529-00142` makes every transaction uniquely identifiable.

---

## Reference Number Format

```
TXN-YYYYMMDD-XXXXX

TXN        — fixed prefix
YYYYMMDD   — transaction date (UTC)
XXXXX      — 5-digit zero-padded daily sequence, resets at midnight

Example:  TXN-20260529-00001  (first transaction of the day)
          TXN-20260529-00142  (142nd transaction of the day)
```

---

## Acceptance Criteria

### 1. Generation

1. Every new transaction (transfer, deposit, withdrawal, airdrop, fee) gets a `reference` assigned at write time — before the document is saved
2. Reference must be globally unique — enforced via a unique index on the `reference` field in MongoDB
3. Sequence is atomic — use a `Counter` collection with `findOneAndUpdate + $inc` so concurrent transactions on the same day never produce duplicates
4. If the `Counter` document for today does not exist, create it with `seq: 1` and use `1` as the sequence for this transaction
5. Reference is never editable after creation

### 2. Counter Collection

```
Collection: counters
Document:   { _id: "txn_20260529", seq: 142 }
```

- `_id` = `"txn_" + YYYYMMDD` of transaction date
- `seq` incremented atomically with each transaction
- Old counter documents can be archived/deleted after 90 days (out of scope for Phase 5)

### 3. Schema

1. `reference` field added to `Transaction` model: `String`, sparse unique index
2. `sparse: true` allows existing null documents to coexist without index conflicts
3. All new writes must populate `reference` — a transaction without a reference is a bug

### 4. API responses

1. `reference` included in all transaction responses: list, detail, transfer response
2. `GET /transactions/account/:accountNumber` — `reference` in every item
3. `GET /transactions/:transactionId` — `reference` in response
4. `POST /transactions/transfer` — `reference` of both created transactions returned in response body

### 5. Display

1. Reference shown on transaction receipt (US-T5) — styled prominently, user can long-press/copy
2. Reference shown in transaction list as a secondary line (below date) — smaller, muted colour
3. Admin portal transaction list — reference shown in its own column

### 6. Old transactions

1. Pre-Phase-5 transactions have `reference: null` — this is expected and not an error
2. Null reference displays as `"—"` in all UIs — never show "null" or "undefined"

---

## Sub-tasks

| # | Task | Layer |
| --- | --- | --- |
| T6-BE1 | Add `reference` field to `Transaction` model with sparse unique index | BE |
| T6-BE2 | Create `Counter` model with `getNextSequence(date)` utility | BE |
| T6-BE3 | Call `getNextSequence` in `transferFunds`, `deposit`, `withdraw`, `airdrop` before saving each transaction | BE |
| T6-BE4 | Include `reference` in all transaction API responses | BE |
| T6-FE1 | Show `reference` as secondary line in transaction list (customer + admin) | FE |
| T6-FE2 | Show `reference` prominently on receipt (US-T5 component) | FE |

---

## Related Stories

- **US-T5** — Receipt (displays the reference number)
- **US-T7** — Counterpart (both fields generated at the same write time)
- **US-T8** — Balance after (same write-time enrichment pattern)
