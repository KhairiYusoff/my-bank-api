# US-T5 — Transaction Receipt (Detail View)

**Phase:** 5
**Epic:** Transaction Detail Enrichment
**Status:** 📝 Ready for Development
**Story Points:** 5

---

## Value Statement

As a customer, I want to tap on any transaction in my history to see a full receipt — with the recipient's name, reference number, and my balance after the transaction — so that I can verify the details or quote a reference when contacting support.

---

## Background

The Phase 1 refactor replaced `fromAccountNumber`/`toAccountNumber` fields with a single `account: ObjectId` ref. This lost all counterpart info. Currently the detail view is identical to the list view — same 5 fields, no receipt-grade information. This is a UX failure and a dispute risk.

---

## Screens

**Customer portal — Transaction History page**

```
[ Transaction List ]                    [ Transaction Receipt (drawer/modal) ]

○  Transfer                             ┌─────────────────────────────────┐
   Ahmad K****    RM500.00              │  TRANSFER SENT                  │
   29 May 2026      Completed    →      │  RM500.00                       │
                                        │                                 │
○  Deposit                              │  Reference    TXN-20260529-00142│
   Bank           RM1,000.00            │  To           Ahmad K****       │
   28 May 2026      Completed           │               MYB****5236       │
                                        │  Balance after  RM2,450.00      │
                                        │  Date         29 May 2026 14:32 │
                                        │  Status       Completed         │
                                        │  Fee          RM0.00            │
                                        └─────────────────────────────────┘
```

---

## Navigation

1. Customer is on the Transaction History page (already implemented)
2. Customer taps on any transaction row
3. A receipt drawer or modal opens showing full detail
4. Customer taps close / outside — returns to list

---

## Acceptance Criteria

### 1. Trigger

1. Every transaction row in the list must be tappable/clickable
2. Tapping opens a receipt view (modal or side drawer — FE decision)
3. Receipt loads immediately using data already in the list response — no second API call for basic fields
4. If enriched fields (`reference`, `counterpartName`, `balanceAfter`) are available, they are shown; if null (old pre-Phase-5 transactions), show "—"

### 2. Receipt Fields — Transfers

| Field | Display Label | Source | Notes |
| --- | --- | --- | --- |
| Transaction type | Direction badge | `type` | "TRANSFER SENT" if debit, "TRANSFER RECEIVED" if credit |
| Amount | Large prominent amount | `amount` | Format: `RM X,XXX.XX` |
| Reference number | Reference | `reference` | e.g. `TXN-20260529-00142` — prominent, copyable |
| Counterpart name | To / From | `counterpartName` | Masked: `Ahmad K****` |
| Counterpart account | Account number | `counterpartAccount` | Masked: `MYB****5236` |
| Balance after | Balance after | `balanceAfter` | Format: `RM X,XXX.XX` |
| Date & time | Date | `processingTime.completedAt` or `date` | Format: `29 May 2026, 14:32` |
| Status | Status | `status` | Pill badge: Completed / Pending / Failed |
| Fee | Transaction fee | `fee` | Show `RM0.00` even if zero — builds trust |

### 3. Receipt Fields — Deposits & Withdrawals

Same fields as above with these differences:
1. "To / From" label shows `"MyBank"` for the counterpart name — no account number shown
2. Direction badge: "DEPOSIT RECEIVED" or "WITHDRAWAL MADE"

### 4. Old Transactions (pre-Phase-5, missing enriched fields)

1. If `reference` is null → show `"—"` in the reference field, do NOT show an error
2. If `counterpartName` is null → show `"—"` in the counterpart field
3. If `balanceAfter` is null → omit the "Balance after" row entirely

### 5. Admin / Banker view (my-bank-admin-portal)

1. Admin sees all fields **unmasked**: full counterpart name, full account number
2. Admin additionally sees: `deviceInfo.ip`, `deviceInfo.userAgent` (for fraud investigation)
3. These fields are only served to `admin` and `banker` roles — masked/omitted for `customer` role

### 6. Error state

1. If receipt data fails to load → show: `"Unable to load receipt. Please try again."`
2. Retry button re-fetches from `GET /transactions/:transactionId`

---

## Sub-tasks

| # | Task | Layer |
| --- | --- | --- |
| T5-BE1 | `GET /transactions/:transactionId` — return all enriched fields; mask counterpart for customer role | BE |
| T5-BE2 | `GET /transactions/account/:accountNumber` list — include `reference`, `counterpartName` (masked), `balanceAfter`, `fee` in list response so receipt opens instantly | BE |
| T5-FE1 | Transaction row — make clickable, open receipt drawer/modal | FE (customer) |
| T5-FE2 | Receipt component — all fields, masked display, old-transaction fallback | FE (customer) |
| T5-FE3 | Admin transaction detail — unmasked, add deviceInfo fields | FE (admin) |

---

## Related Stories

- **US-T6** — Reference number (provides the `reference` field shown here)
- **US-T7** — Counterpart visibility (provides `counterpartName`, `counterpartAccount`)
- **US-T8** — Balance after (provides `balanceAfter`)

> US-T5 is the container. US-T6, T7, T8 define what fills it. All 4 must ship together in Phase 5.

---

## Out of Scope

- PDF download of receipt (Phase 9)
- "Report an issue" / dispute CTA (future)
- Push notification on transaction (already built separately)
