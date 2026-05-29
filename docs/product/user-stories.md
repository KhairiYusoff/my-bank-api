# MyBank — User Stories Index

> This file is the index only. Detailed stories with AC live in `docs/user-stories/phase-N/` — **new features only (Phase 5+)**. Built features have no story file; the code and `business-rules.md` are the source of truth.

**Last Updated:** May 30, 2026

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
| 📝     | Story written — ready for development  |
| 🔵     | In progress                            |
| ⬜     | Planned — story not written yet        |

---

## All User Stories

| ID       | Summary                                                                    | Phase | Repo                 | Status | Story File                                       |
| -------- | -------------------------------------------------------------------------- | ----- | -------------------- | ------ | ------------------------------------------------ | --- | ------- | -------------------------------------------------------------- | --- | -------------------------------------- | --- | ------------------------------------------------ | --- | ------- | ---------------------------------------------------------------------- | --- | ----------- | --- | --- |
| US-0001  | Customer logs in with email + password                                     | 0     | my-bank-api          | ✅     | —                                                |
| US-0002  | Session persists across page refreshes                                     | 0     | my-bank-customer     | ✅     | —                                                |
| US-0003  | Customer resets password via email                                         | 0     | my-bank-api          | ✅     | —                                                |
| US-0004  | New customer submits digital application                                   | 0     | my-bank-customer     | ✅     | —                                                |
| US-0005  | Customer notified on application approval/rejection                        | 0     | notification-service | ✅     | —                                                |
| US-0006  | Customer completes profile after approval                                  | 0     | my-bank-customer     | ✅     | —                                                |
| US-0007  | Banker reviews and approves/rejects applications                           | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0008  | Banker verifies customer identity (KYC)                                    | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0009  | Banker creates Savings/Current/Business account                            | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0010  | Banker deposits money into customer account                                | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0011  | Customer withdraws from own account                                        | 0     | my-bank-customer     | ✅     | —                                                |
| US-0012  | Admin airdrops funds to any account                                        | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0013  | Customer transfers money to any MyBank account                             | 0     | my-bank-customer     | ✅     | —                                                |
| US-0014  | Transfer blocked if insufficient funds                                     | 0     | my-bank-api          | ✅     | —                                                |
| US-0015  | Customer logs expense with amount, category, date                          | 0     | my-bank-customer     | ✅     | —                                                |
| US-0016  | Customer views monthly/yearly analytics by category                        | 0     | my-bank-customer     | ✅     | —                                                |
| US-0017  | Customer views spending dashboard                                          | 0     | my-bank-customer     | ✅     | —                                                |
| US-0018  | Admin creates banker accounts                                              | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0019  | Admin views audit logs filtered by user/action/date                        | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-0020  | Banker views customer full activity log                                    | 0     | my-bank-admin-portal | ✅     | —                                                |
| US-3001  | Customer views all accounts and balances                                   | 3     | my-bank-customer     | ✅     | —                                                |
| US-3002  | Customer views paginated transaction history                               | 3     | my-bank-customer     | ✅     | —                                                |
| US-3003  | Admin views all transactions across all accounts                           | 3     | my-bank-admin-portal | ✅     | —                                                |
| US-3004  | Admin updates or deactivates staff account                                 | 3     | my-bank-admin-portal | ✅     | —                                                |
| US-5001  | Transaction model enrichment — new fields, Counter, masking, API responses | 5     | my-bank-api          | 📝     | [US-5001.md](../user-stories/phase-5/US-5001.md) |
| US-5002  | Transaction receipt view — customer portal                                 | 5     | my-bank-customer     | 📝     | [US-5002.md](../user-stories/phase-5/US-5002.md) |
| US-5003  | Transaction detail view — admin portal (unmasked)                          | 5     | my-bank-admin-portal                   | 📝     | [US-5003.md](../user-stories/phase-5/US-5003.md) |
| US-5004  | Currency display standardised — all amounts show `RM X,XXX.XX`             | 5     | my-bank-customer, my-bank-admin-portal | 📝     | [US-5004.md](../user-stories/phase-5/US-5004.md) |
| US-6001  | Account type rules enforced (daily limits, withdrawal caps, overdraft)     | 6     | my-bank-api                            | ⬜     | —                                                |
| US-6002  | Savings monthly withdrawal cap enforced (max 4/month)                      | 6     | my-bank-api          | ⬜     | —                                                |
| US-6003  | Banker sets overdraft limit on Current/Business account                    | 6     | my-bank-admin-portal | ⬜     | —                                                |
| US-6004  | Transfer blocked if daily limit exceeded                                   | 6     | my-bank-api          | ⬜     | —                                                |
| US-6005  | Customer sees account type rules and limits in portal                      | 6     | my-bank-customer     | ⬜     | —                                                |
| US-6006  | Monthly maintenance fee deducted automatically                             | 6     | my-bank-api          | ⬜     | —                                                |
| US-6007  | Savings interest credited monthly                                          | 6     | my-bank-api          | ⬜     | —                                                |
| US-6008  | Customer notified when balance falls below maintenance threshold           | 6     | notification-service | ⬜     | —                                                |
| US-7001  | Banker creates Fixed Deposit account for customer                          | 7     | my-bank-admin-portal | ⬜     | —                                                |
| US-7002  | Customer views FD with maturity date and expected interest                 | 7     | my-bank-customer     | ⬜     | —                                                |
| US-7003  | Customer notified 7 days before FD matures                                 | 7     | notification-service | ⬜     | —                                                |
| US-7004  | Customer withdraws FD at maturity (principal + interest)                   | 7     | my-bank-api          | ⬜     | —                                                |
| US-7005  | Customer withdraws FD early (forfeits interest)                            | 7     | my-bank-api          | ⬜     | —                                                |
| US-7006  | FD auto-renews if no action after maturity                                 | 7     | my-bank-api          | ⬜     | —                                                |
| US-8001  | Account goes dormant after 12 months no activity (cron)                    | 8     | my-bank-api          | ⬜     | —                                                |
| US-8002  | Dormant account shows clear message with reactivation steps                | 8     | my-bank-customer     | ⬜     | —                                                |
| US-8003  | Customer notified at 11 months no activity (pre-dormancy warning)          | 8     | notification-service | ⬜     | —                                                |
| US-8004  | Banker reactivates dormant account                                         | 8     | my-bank-admin-portal | ⬜     | —                                                |
| US-8005  | Admin suspends a customer account                                          | 8     | my-bank-admin-portal | ⬜     | —                                                |
| US-8006  | Customer requests account closure                                          | 8     | my-bank-customer     | ⬜     | —                                                |
| US-9001  | Customer views monthly statement for any account                           | 9     | my-bank-customer     | ⬜     | —                                                |
| US-9002  | Statement shows opening/closing balance, credits, debits, transaction list | 9     | my-bank-api          | ⬜     | —                                                |
| US-9003  | Customer downloads statement as PDF                                        | 9     | my-bank-customer     | ⬜     | —                                                |
| US-10001 | Customer saves a beneficiary with nickname                                 | 10    | my-bank-customer     | ⬜     | —                                                |
| US-10002 | Customer manages (add/edit/delete) beneficiaries                           | 10    | my-bank-customer     | ⬜     | —                                                |
| US-10003 | Transfer form pre-fills account number from saved beneficiary              | 10    | my-bank-customer     | ⬜     | —                                                |
| US-11001 | Customer asks AI questions about accounts and transactions                 | 11    | my-bank-customer     | ⬜     | —                                                |
| US-11002 | AI chat history persists across page navigation                            | 11    | my-bank-customer     | ⬜     | —                                                |
| US-11003 | AI answers based on user's actual data, not generic                        | 11    | my-bank-api          | ⬜     | —                                                |
| US-11004 | AI responds without unprompted disclaimers                                 | 11    | my-bank-api          | ⬜     | —                                                |
| US-11005 | AI chat cleared on logout                                                  | 11    | my-bank-customer     | ⬜     | —                                                |
