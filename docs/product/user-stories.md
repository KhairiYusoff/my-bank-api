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

| Symbol | Meaning |
| ------ | ------- |
| ✅ | Built — no story file, already shipped |
| 📝 | Story written — ready for development |
| 🔵 | In progress |
| ⬜ | Planned — story not written yet |

---

## All User Stories

| ID | Summary | Phase | Status | Story File |
| --- | --- | --- | --- | --- |
| US-0001 | Customer logs in with email + password | 0 | ✅ | — |
| US-0002 | Session persists across page refreshes | 0 | ✅ | — |
| US-0003 | Customer resets password via email | 0 | ✅ | — |
| US-0004 | New customer submits digital application | 0 | ✅ | — |
| US-0005 | Customer notified on application approval/rejection | 0 | ✅ | — |
| US-0006 | Customer completes profile after approval | 0 | ✅ | — |
| US-0007 | Banker reviews and approves/rejects applications | 0 | ✅ | — |
| US-0008 | Banker verifies customer identity (KYC) | 0 | ✅ | — |
| US-0009 | Banker creates Savings/Current/Business account | 0 | ✅ | — |
| US-0010 | Banker deposits money into customer account | 0 | ✅ | — |
| US-0011 | Customer withdraws from own account | 0 | ✅ | — |
| US-0012 | Admin airdrops funds to any account | 0 | ✅ | — |
| US-0013 | Customer transfers money to any MyBank account | 0 | ✅ | — |
| US-0014 | Transfer blocked if insufficient funds | 0 | ✅ | — |
| US-0015 | Customer logs expense with amount, category, date | 0 | ✅ | — |
| US-0016 | Customer views monthly/yearly analytics by category | 0 | ✅ | — |
| US-0017 | Customer views spending dashboard | 0 | ✅ | — |
| US-0018 | Admin creates banker accounts | 0 | ✅ | — |
| US-0019 | Admin views audit logs filtered by user/action/date | 0 | ✅ | — |
| US-0020 | Banker views customer full activity log | 0 | ✅ | — |
| US-3001 | Customer views all accounts and balances | 3 | ✅ | — |
| US-3002 | Customer views paginated transaction history | 3 | ✅ | — |
| US-3003 | Admin views all transactions across all accounts | 3 | ✅ | — |
| US-3004 | Admin updates or deactivates staff account | 3 | ✅ | — |
| US-5001 | Customer views full transaction receipt (reference, counterpart, balance after) | 5 | 📝 | [US-5001.md](../user-stories/phase-5/US-5001.md) |
| US-6001 | Account type rules enforced (daily limits, withdrawal caps, overdraft) | 6 | ⬜ | — |
| US-6002 | Savings monthly withdrawal cap enforced (max 4/month) | 6 | ⬜ | — |
| US-6003 | Banker sets overdraft limit on Current/Business account | 6 | ⬜ | — |
| US-6004 | Transfer blocked if daily limit exceeded | 6 | ⬜ | — |
| US-6005 | Customer sees account type rules and limits in portal | 6 | ⬜ | — |
| US-6006 | Monthly maintenance fee deducted automatically | 6 | ⬜ | — |
| US-6007 | Savings interest credited monthly | 6 | ⬜ | — |
| US-6008 | Customer notified when balance falls below maintenance threshold | 6 | ⬜ | — |
| US-7001 | Banker creates Fixed Deposit account for customer | 7 | ⬜ | — |
| US-7002 | Customer views FD with maturity date and expected interest | 7 | ⬜ | — |
| US-7003 | Customer notified 7 days before FD matures | 7 | ⬜ | — |
| US-7004 | Customer withdraws FD at maturity (principal + interest) | 7 | ⬜ | — |
| US-7005 | Customer withdraws FD early (forfeits interest) | 7 | ⬜ | — |
| US-7006 | FD auto-renews if no action after maturity | 7 | ⬜ | — |
| US-8001 | Account goes dormant after 12 months no activity (cron) | 8 | ⬜ | — |
| US-8002 | Dormant account shows clear message with reactivation steps | 8 | ⬜ | — |
| US-8003 | Customer notified at 11 months no activity (pre-dormancy warning) | 8 | ⬜ | — |
| US-8004 | Banker reactivates dormant account | 8 | ⬜ | — |
| US-8005 | Admin suspends a customer account | 8 | ⬜ | — |
| US-8006 | Customer requests account closure | 8 | ⬜ | — |
| US-9001 | Customer views monthly statement for any account | 9 | ⬜ | — |
| US-9002 | Statement shows opening/closing balance, credits, debits, transaction list | 9 | ⬜ | — |
| US-9003 | Customer downloads statement as PDF | 9 | ⬜ | — |
| US-10001 | Customer saves a beneficiary with nickname | 10 | ⬜ | — |
| US-10002 | Customer manages (add/edit/delete) beneficiaries | 10 | ⬜ | — |
| US-10003 | Transfer form pre-fills account number from saved beneficiary | 10 | ⬜ | — |
| US-11001 | Customer asks AI questions about accounts and transactions | 11 | ⬜ | — |
| US-11002 | AI chat history persists across page navigation | 11 | ⬜ | — |
| US-11003 | AI answers based on user's actual data, not generic | 11 | ⬜ | — |
| US-11004 | AI responds without unprompted disclaimers | 11 | ⬜ | — |
| US-11005 | AI chat cleared on logout | 11 | ⬜ | — |
