# MyBank — User Stories Index

> This file is the index only. Detailed stories with AC live in `docs/user-stories/phase-N/` — **new features only (Phase 5+)**. Built features have no story file; the code and `business-rules.md` are the source of truth.

**Last Updated:** Jun 10, 2026

---

## ID Convention

`US-PXXX` — P = phase number, XXX = zero-padded sequence within that phase.

- `US-0001` = Phase 0, story 1
- `US-5001` = Phase 5, story 1

Sub-tasks in story files follow: `US-5001-BE1`, `US-5001-FE1` etc.

---

## Status Legend

| Symbol | Meaning                                |
| ------ | -------------------------------------- |
| ✅     | Built — no story file, already shipped |
| 🟡     | Story written — ready for development  |
| 🔵     | In progress                            |
| ⬜     | Planned — story not written yet        |

---

## All User Stories

| ID       | Summary                                                                      | Phase | Repo                                   | Status | Story File                                       |
| -------- | ---------------------------------------------------------------------------- | ----- | -------------------------------------- | ------ | ------------------------------------------------ |
| US-0001  | Customer logs in with email + password                                       | 0     | my-bank-api                            | ✅     | —                                                |
| US-0002  | Session persists across page refreshes                                       | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0003  | Customer resets password via email                                           | 0     | my-bank-api                            | ✅     | —                                                |
| US-0004  | New customer submits digital application                                     | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0005  | Customer notified on application approval/rejection                          | 0     | notification-service                   | ✅     | —                                                |
| US-0006  | Customer completes profile after approval                                    | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0007  | Banker reviews and approves/rejects applications                             | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0008  | Banker verifies customer identity (KYC)                                      | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0009  | Banker creates Savings/Current/Business account                              | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0010  | Banker deposits money into customer account                                  | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0011  | Customer withdraws from own account                                          | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0012  | Admin airdrops funds to any account                                          | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0013  | Customer transfers money to any MyBank account                               | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0014  | Transfer blocked if insufficient funds                                       | 0     | my-bank-api                            | ✅     | —                                                |
| US-0015  | Customer logs expense with amount, category, date                            | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0016  | Customer views monthly/yearly analytics by category                          | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0017  | Customer views spending dashboard                                            | 0     | my-bank-customer                       | ✅     | —                                                |
| US-0018  | Admin creates banker accounts                                                | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0019  | Admin views audit logs filtered by user/action/date                          | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-0020  | Banker views customer full activity log                                      | 0     | my-bank-admin-portal                   | ✅     | —                                                |
| US-3001  | Customer views all accounts and balances                                     | 3     | my-bank-customer                       | ✅     | —                                                |
| US-3002  | Customer views paginated transaction history                                 | 3     | my-bank-customer                       | ✅     | —                                                |
| US-3003  | Admin views all transactions across all accounts                             | 3     | my-bank-admin-portal                   | ✅     | —                                                |
| US-3004  | Admin updates or deactivates staff account                                   | 3     | my-bank-admin-portal                   | ✅     | —                                                |
| US-5001  | Transaction model enrichment — new fields, Counter, masking, API responses   | 5     | my-bank-api                            | ✅     | [US-5001.md](../user-stories/phase-5/US-5001.md) |
| US-5002  | Transaction receipt view — customer portal                                   | 5     | my-bank-customer                       | ✅     | [US-5002.md](../user-stories/phase-5/US-5002.md) |
| US-5003  | Transaction detail view — admin portal (unmasked)                            | 5     | my-bank-admin-portal                   | ✅     | [US-5003.md](../user-stories/phase-5/US-5003.md) |
| US-5004  | Currency display standardised — all amounts show `RM X,XXX.XX`               | 5     | my-bank-customer, my-bank-admin-portal | ✅     | [US-5004.md](../user-stories/phase-5/US-5004.md) |
| US-6001  | Admin views full customer profile — detail page                              | 6     | my-bank-api, my-bank-admin-portal      | ✅     | [US-6001.md](../user-stories/phase-6/US-6001.md) |
| US-6002  | Admin views staff profile — detail page                                      | 6     | my-bank-api, my-bank-admin-portal      | ✅     | [US-6002.md](../user-stories/phase-6/US-6002.md) |
| US-6003  | Admin views account detail page                                              | 6     | my-bank-api, my-bank-admin-portal      | ✅     | [US-6003.md](../user-stories/phase-6/US-6003.md) |
| US-7001  | Transfer & withdrawal rules enforced — limits, overdraft, FD/status blocks   | 7     | my-bank-api                            | ✅     | [US-7001.md](../user-stories/phase-7/US-7001.md) |
| ~~US-7002~~ | ~~Savings monthly withdrawal cap (max 4/month)~~                          | 7     | —                                      | ❌ dropped | [US-7002.md](../user-stories/phase-7/US-7002.md) |
| US-7003  | Banker sets overdraft limit on Current/Business account                      | 7     | my-bank-api, my-bank-admin-portal      | ✅     | [US-7003.md](../user-stories/phase-7/US-7003.md) |
| US-7005  | Customer sees account type limits — chip tooltip + GET /accounts/limits      | 7     | my-bank-customer, my-bank-api          | ✅     | [US-7005.md](../user-stories/phase-7/US-7005.md) |
| US-7006  | Monthly maintenance fee deducted automatically (cron)                        | 7     | my-bank-api                            | ✅     | [US-7006.md](../user-stories/phase-7/US-7006.md) |
| US-7007  | Savings interest credited monthly (cron)                                     | 7     | my-bank-api                            | ✅     | [US-7007.md](../user-stories/phase-7/US-7007.md) |
| US-7008  | Low balance alert — notifyBelowThreshold utility wired into withdraw/transfer | 7     | my-bank-api                            | ✅     | [US-7008.md](../user-stories/phase-7/US-7008.md) |
| US-8001  | Add `auditor` role — update User model enum and all `authorizeRoles()` calls | 8     | my-bank-api                            | ✅     | [US-8001.md](../user-stories/phase-8/US-8001.md) |
| US-8002  | Staff first-login flow — forced password change + profile setup              | 8     | my-bank-api, my-bank-admin-portal      | ✅     | [US-8002.md](../user-stories/phase-8/US-8002.md) |
| US-8003  | Role-based access control — sidebar nav, route guards, dashboard cards, 403 page | 8     | my-bank-api, my-bank-admin-portal      | ✅     | [US-8003.md](../user-stories/phase-8/US-8003.md) |
| US-9001  | Unified Provisioning Engine — Backend logic for account requests and approvals | 9     | my-bank-api                            | ✅     | [US-9001.md](../user-stories/phase-9/US-9001.md) |
| US-9002  | FD Onboarding UI — Request workflow for customer, approval dashboard for banker | 9     | my-bank-customer, my-bank-admin-portal | ✅     | [US-9002.md](../user-stories/phase-9/US-9002.md) |
| US-9003  | Maturity & Renewal Engine — Cron processing for FD maturity and renewal        | 9     | my-bank-api                            | ✅     | [US-9003.md](../user-stories/phase-9/US-9003.md) |
| US-9004  | FD Settlement at Maturity — Customer manually withdraws principal during grace period | 9     | my-bank-api, my-bank-customer          | ⬜     | [US-9004.md](../user-stories/phase-9/US-9004.md) |
| US-9005  | Emergency Early FD Withdrawal — Breaking the lock with interest forfeiture       | 9     | my-bank-api, my-bank-customer          | ⬜     | [US-9005.md](../user-stories/phase-9/US-9005.md) |
| US-9006  | FD Maturity Instruction Management — Toggle auto-renewal and receive alerts      | 9     | my-bank-api, my-bank-customer          | ⬜     | [US-9006.md](../user-stories/phase-9/US-9006.md) |
| US-10001 | Account goes dormant after 12 months no activity (cron)                      | 10    | my-bank-api                            | ⬜     | —                                                |
| US-10002 | Dormant account shows clear message with reactivation steps                  | 10    | my-bank-customer                       | ⬜     | —                                                |
| US-10003 | Customer notified at 11 months no activity (pre-dormancy warning)            | 10    | notification-service                   | ⬜     | —                                                |
| US-10004 | Banker reactivates dormant account                                           | 10    | my-bank-admin-portal                   | ⬜     | —                                                |
| US-10005 | Admin suspends a customer account                                            | 10    | my-bank-admin-portal                   | ⬜     | —                                                |
| US-10006 | Customer requests account closure                                            | 10    | my-bank-customer                       | ⬜     | —                                                |
| US-11001 | Customer views monthly statement for any account                             | 11    | my-bank-customer                       | ⬜     | —                                                |
| US-11002 | Statement shows opening/closing balance, credits, debits, transaction list   | 11    | my-bank-api                            | ⬜     | —                                                |
| US-11003 | Customer downloads statement as PDF                                          | 11    | my-bank-customer                       | ⬜     | —                                                |
| US-12001 | Customer saves a beneficiary with nickname                                   | 12    | my-bank-customer                       | ⬜     | —                                                |
| US-12002 | Customer manages (add/edit/delete) beneficiaries                             | 12    | my-bank-customer                       | ⬜     | —                                                |
| US-12003 | Transfer form pre-fills account number from saved beneficiary                | 12    | my-bank-customer                       | ⬜     | —                                                |
| US-13001 | Customer asks AI questions about accounts and transactions                   | 13    | my-bank-customer                       | ⬜     | —                                                |
| US-13002 | AI chat history persists across page navigation                              | 13    | my-bank-customer                       | ⬜     | —                                                |
| US-13003 | AI answers based on user's actual data, not generic                          | 13    | my-bank-api                            | ⬜     | —                                                |
| US-13004 | AI responds without unprompted disclaimers                                   | 13    | my-bank-api                            | ⬜     | —                                                |
| US-13005 | AI chat cleared on logout                                                    | 13    | my-bank-customer                       | ⬜     | —                                                |
