# MyBank — User Stories Index

> This file is the index only. Detailed stories with AC live in `docs/user-stories/` — **new features only (Phase 5+)**. Already-built features have no story file; the code and `business-rules.md` are the source of truth.

**Last Updated:** May 29, 2026

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
| US-A1 | Customer logs in with email + password | 0 | ✅ | — |
| US-A2 | Session persists across page refreshes | 0 | ✅ | — |
| US-A3 | Customer resets password via email | 0 | ✅ | — |
| US-A4 | Auto logout after inactivity | — | ⬜ | — |
| US-O1 | New customer submits digital application | 0 | ✅ | — |
| US-O2 | Customer notified on application approval/rejection | 0 | ✅ | — |
| US-O3 | Customer completes profile after approval | 0 | ✅ | — |
| US-O4 | Banker reviews and approves/rejects applications | 0 | ✅ | — |
| US-O5 | Banker verifies customer identity (KYC) | 0 | ✅ | — |
| US-AC1 | Banker creates Savings/Current/Business account | 0 | ✅ | — |
| US-AC2 | Banker creates Fixed Deposit account | 7 | ⬜ | — |
| US-AC3 | Customer views all accounts and balances | 3 | ✅ | — |
| US-AC4 | Customer sees account type rules and limits | 6 | ⬜ | — |
| US-AC5 | Banker sets overdraft limit on Current/Business | 6 | ⬜ | — |
| US-AC6 | Banker deposits money into customer account | 0 | ✅ | — |
| US-AC7 | Customer withdraws from own account | 0 | ✅ | — |
| US-AC8 | Savings monthly withdrawal cap enforced | 6 | ⬜ | — |
| US-AC9 | Admin airdrops funds to any account | 0 | ✅ | — |
| US-AC10 | Customer requests account closure | 8 | ⬜ | — |
| US-AC11 | Banker reactivates dormant account | 8 | ⬜ | — |
| US-T1 | Customer transfers money to any MyBank account | 0 | ✅ | — |
| US-T2 | Transfer blocked if insufficient funds | 0 | ✅ | — |
| US-T3 | Transfer blocked if daily limit exceeded | 6 | ⬜ | — |
| US-T4 | Customer views paginated transaction history | 3 | ✅ | — |
| US-T5 | Customer views detailed transaction receipt | 5 | 📝 | [US-T5-transaction-receipt.md](../user-stories/phase-5/US-T5-transaction-receipt.md) |
| US-T6 | Every transaction has a human-readable reference number | 5 | 📝 | [US-T6-reference-number.md](../user-stories/phase-5/US-T6-reference-number.md) |
| US-T7 | Customer sees counterpart name on transfers | 5 | 📝 | [US-T7-counterpart-visibility.md](../user-stories/phase-5/US-T7-counterpart-visibility.md) |
| US-T8 | Customer sees balance after each transaction | 5 | 📝 | [US-T8-balance-after.md](../user-stories/phase-5/US-T8-balance-after.md) |
| US-T9 | Admin views all transactions across all accounts | 3 | ✅ | — |
| US-FD1 | Customer views FD with maturity date and expected interest | 7 | ⬜ | — |
| US-FD2 | Customer notified 7 days before FD matures | 7 | ⬜ | — |
| US-FD3 | Customer withdraws FD at maturity (principal + interest) | 7 | ⬜ | — |
| US-FD4 | Customer withdraws FD early (forfeits interest) | 7 | ⬜ | — |
| US-FD5 | FD auto-renews if no action after maturity | 7 | ⬜ | — |
| US-FI1 | Maintenance fees visible on statement | 6 | ⬜ | — |
| US-FI2 | Savings interest credited monthly | 6 | ⬜ | — |
| US-FI3 | Customer notified when balance below maintenance threshold | 6 | ⬜ | — |
| US-LC1 | Customer notified at 11 months no activity (pre-dormancy) | 8 | ⬜ | — |
| US-LC2 | Dormant account shows clear message with reactivation steps | 8 | ⬜ | — |
| US-LC3 | Admin suspends a customer account | 8 | ⬜ | — |
| US-ST1 | Customer views monthly statement for any account | 9 | ⬜ | — |
| US-ST2 | Statement shows opening/closing balance, credits, debits, list | 9 | ⬜ | — |
| US-ST3 | Customer downloads statement as PDF | 9 | ⬜ | — |
| US-B1 | Customer saves a beneficiary with nickname | 10 | ⬜ | — |
| US-B2 | Customer manages (add/edit/delete) beneficiaries | 10 | ⬜ | — |
| US-B3 | Transfer form pre-fills account number from beneficiary | 10 | ⬜ | — |
| US-E1 | Customer logs expense with amount, category, date | 0 | ✅ | — |
| US-E2 | Customer views monthly/yearly analytics by category | 0 | ✅ | — |
| US-E3 | Customer views spending dashboard | 0 | ✅ | — |
| US-AI1 | Customer asks AI questions about accounts and transactions | 11 | ⬜ | — |
| US-AI2 | AI chat history persists across page navigation | 11 | ⬜ | — |
| US-AI3 | AI answers based on user's actual data | 11 | ⬜ | — |
| US-AI4 | AI responds without unprompted disclaimers | 11 | ⬜ | — |
| US-AI5 | AI chat cleared on logout | 11 | ⬜ | — |
| US-ADM1 | Admin creates banker accounts | 0 | ✅ | — |
| US-ADM2 | Admin updates or deactivates staff account | 3 | ✅ | — |
| US-ADM3 | Admin views audit logs filtered by user/action/date | 0 | ✅ | — |
| US-ADM4 | Banker views customer full activity log | 0 | ✅ | — |
