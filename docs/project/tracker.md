# Tracker

**Last Updated:** May 29, 2026
**Current Phase:** Phase 3 — Client Coverage Audit & Gap Closure

See [roadmap.md](roadmap.md) for full project history and phase descriptions.

---

## Now — Phase 3B: Customer App Gap Closure

| #   | Task                                                                                   | Status  |
| --- | -------------------------------------------------------------------------------------- | ------- |
| 3B1 | Wire `GET /accounts/` — already consumed in Dashboard + hooks                          | ✅ Done |
| 3B2 | Wire `GET /transactions/:transactionId` — transaction detail modal in customer app     | ⬜ TODO |
| 3B3 | Wire `GET /expenses/categories` + `/payment-methods` — consumed in `useExpenseActions` | ✅ Done |
| 3B4 | Wire `GET /expenses/dashboard/stats` — consumed in `useAnalytics`                      | ✅ Done |
| 3B5 | Wire `DELETE /users/me` — account self-deletion flow                                   | ⬜ TODO |

---

## Completed

### Phase 3A — Admin Portal Gap Closure (May 29, 2026) ✅

| #   | Task                                                                                                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 3A1 | P0 fix: `GET /transactions/account/:accountNumber` returning empty — wrong query field (`accountNumber` vs `account._id`) in `transaction.service.js` |
| 3A2 | Wired `PUT /admin/staff/:staffId` + `DELETE /admin/staff/:staffId` — inline role/status edit + delete confirm in `StaffPage`                          |
| 3A3 | Wired `PUT /admin/customer/:customerId` + `DELETE /admin/customer/:customerId` — inline status edit + delete confirm in `UsersList`                   |
| 3A4 | Wired `GET /transactions/:transactionId` — detail dialog in `TransactionsList`                                                                        |
| 3A5 | Added `StyledTableCell` + `StyledTableRow` missing exports to `TableStyles.tsx`                                                                       |

---

## Completed

### Phase 2 — Architecture Completion (May 25, 2026) ✅

| #   | Task                                                                                                        |
| --- | ----------------------------------------------------------------------------------------------------------- |
| 2D  | Replaced all 6 local `handleError` copies with shared `error()` utility                                     |
| 2A  | Created `auth.service.js` — extracted login, logout, refreshToken                                           |
| 2B  | Expanded `onboarding.service.js` — extracted apply, completeProfile, verifyCustomer, getPendingApplications |
| 2C  | Expanded `audit.service.js` — extracted 3 read functions with shared `_queryLogs` builder                   |

### Phase 1 — Codebase Hardening (May 13–19, 2026) ✅

All 1A–1E tasks done. See roadmap.md for detail.

### Phase 0 — Foundation & Deployment (May 8–10, 2026) ✅

All services deployed. P0 bugs fixed. See roadmap.md for detail.

---

## Notes

- AI scaffolding already exists: `ai.controller.js`, `ai.service.js`, `ai.guardrails.js`, `ai.tools.js`
- `notifications` module has no service layer — thin proxy, low priority, not blocking P3
- `DELETE /users/me` — intentionally unwired. Banking apps don't allow self-deletion due to compliance/data retention obligations. Route via banker workflow when needed.

---

## Phase 5 Backlog — Transaction Detail Enrichment

| #   | Task | Priority |
| --- | ---- | -------- |
| 5A1 | Add `reference`, `counterpartAccount`, `counterpartName`, `balanceAfter` to `Transaction` schema | 🔴 MVP |
| 5A2 | Populate new fields in `transferFunds` service for both from/to records | 🔴 MVP |
| 5A3 | Include new fields in `getAccountTransactions` + `getTransactionDetails` responses | 🔴 MVP |
| 5B1 | Receipt-style transaction detail dialog in customer app | 🔴 MVP |
| 5B2 | Unmasked detail view in admin portal for fraud investigation | 🔴 MVP |
| 5C1 | Add `fee`, `category`, `processingTime` fields to schema | 🟡 Nice-to-have |
| 5C2 | Share / download as PDF receipt in customer app | 🟡 Nice-to-have |
| 5C3 | "Report an issue" CTA pre-filled with reference number | 🟡 Nice-to-have |
| 5C4 | `deviceInfo` / IP logging on transaction write | 🟡 Nice-to-have |

---

## Performance Optimization Backlog

Items identified during architecture audit (May 28, 2026). Not blocking any current phase.

| #   | Item                                                                                                                          | Impact | Status  |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | ------ | ------- |
| P1  | `authorizeRoles` fires a redundant `User.findById` on every protected request — `req.user` is already set by `authMiddleware` | Medium | ⬜ TODO |
| P2  | Route auto-loader — `server.js` manually imports every route module; a dynamic loader would scale better at 20+ modules       | Low    | ⬜ TODO |
