# MyBank — User Stories

> Stories are written from the perspective of the end user. Acceptance criteria live in `requirements.md`. Business rules live in `business-rules.md`.

**Last Updated:** May 29, 2026

---

## Roles

- **Customer** — registered and verified bank customer
- **Banker** — internal staff who manages accounts and customers
- **Admin** — system administrator with full access

---

## Authentication

**US-A1:** As a customer, I want to log in with my email and password so that I can access my banking portal securely.

**US-A2:** As a customer, I want my session to persist across page refreshes so that I don't have to log in repeatedly.

**US-A3:** As a customer, I want to reset my password via email so that I can regain access if I forget it.

**US-A4:** As any user, I want to be automatically logged out after inactivity so that my account is protected if I leave my device unattended.

---

## Onboarding

**US-O1:** As a new customer, I want to submit a digital application with my personal details so that I can open a bank account without visiting a branch.

**US-O2:** As a new customer, I want to be notified when my application is approved or rejected so that I know the outcome without checking manually.

**US-O3:** As a new customer, I want to complete my profile after approval so that my account is fully set up.

**US-O4:** As a banker, I want to review pending applications so that I can approve or reject them with a reason.

**US-O5:** As a banker, I want to verify a customer's identity before approving their account so that we meet KYC requirements.

---

## Accounts

**US-AC1:** As a banker, I want to create a Savings, Current, or Business account for a customer so that they have the right account for their needs.

**US-AC2:** As a banker, I want to create a Fixed Deposit account for a customer with a chosen lock period so that the customer earns guaranteed interest.

**US-AC3:** As a customer, I want to view all my accounts and their balances in one place so that I have a clear overview of my finances.

**US-AC4:** As a customer, I want to see my account type and its rules (withdrawal limit, daily transfer cap) so that I understand what I can and cannot do.

**US-AC5:** As a banker, I want to set an overdraft limit on a Current or Business account so that the customer can transact within an approved negative balance.

**US-AC6:** As a banker, I want to deposit money into a customer's account so that the customer's balance is updated immediately.

**US-AC7:** As a customer, I want to withdraw money from my account so that I can access my funds.

**US-AC8:** As a customer, I want to be blocked from exceeding my monthly withdrawal limit (Savings) so that my account stays within allowed rules.

**US-AC9:** As an admin, I want to airdrop funds to any account so that I can top up accounts for testing or promotional purposes.

**US-AC10:** As a customer, I want to request account closure so that I can close an account I no longer need.

**US-AC11:** As a banker, I want to reactivate a dormant account so that the customer can resume transactions.

---

## Transactions

**US-T1:** As a customer, I want to transfer money to any MyBank account so that I can pay people easily.

**US-T2:** As a customer, I want to be blocked from transferring if I have insufficient funds so that I never accidentally overdraw (unless on Current/Business with overdraft).

**US-T3:** As a customer, I want to be blocked from transferring more than my daily limit so that my account is protected from large unauthorised movements.

**US-T4:** As a customer, I want to see my transaction history with pagination so that I can review past activity.

**US-T5:** As a customer, I want to tap a transaction to see a detailed receipt — including the recipient's name, reference number, and my balance after the transaction — so that I can verify or dispute it.

**US-T6:** As a customer, I want every transaction to have a human-readable reference number (e.g. TXN-20260529-00142) so that I can quote it when contacting support.

**US-T7:** As a customer, I want to see who I sent money to and who sent me money so that I can identify transfers without ambiguity.

**US-T8:** As a customer, I want to see my account balance after each transaction so that I can track my running balance.

**US-T9:** As an admin, I want to view all transactions across all accounts so that I can monitor for unusual activity.

---

## Fixed Deposit

**US-FD1:** As a customer, I want to view my Fixed Deposit account with its maturity date, lock period, and expected interest so that I know when and how much I will receive.

**US-FD2:** As a customer, I want to be notified when my FD is about to mature (7 days before) so that I can decide whether to renew or withdraw.

**US-FD3:** As a customer, I want to withdraw my FD at maturity and receive principal + interest so that I get the full benefit.

**US-FD4:** As a customer, I want to withdraw my FD early if needed and understand I will forfeit all interest so that I can make an informed decision.

**US-FD5:** As a customer, I want my FD to auto-renew if I take no action after maturity so that I don't miss out on continued returns.

---

## Fees & Interest

**US-FI1:** As a customer, I want to see any maintenance fees deducted from my account on the statement so that I know what I'm being charged and why.

**US-FI2:** As a customer, I want interest credited to my Savings account monthly so that my money grows passively.

**US-FI3:** As a customer, I want to be notified if my balance falls below the minimum required to avoid a maintenance fee so that I can top up in time.

---

## Account Lifecycle

**US-LC1:** As a customer, I want to be notified if my account is approaching dormancy (11 months no activity) so that I can make a transaction to keep it active.

**US-LC2:** As a customer, I want to see a clear message if my account is dormant and understand what to do to reactivate it so that I'm not confused by blocked transactions.

**US-LC3:** As an admin, I want to suspend a customer's account so that I can block transactions when fraud is suspected.

---

## Statements

**US-ST1:** As a customer, I want to view a monthly statement for any of my accounts so that I have a clear record of all activity in that period.

**US-ST2:** As a customer, I want my statement to show opening balance, closing balance, total credits, total debits, and a transaction list so that I have everything I need in one view.

**US-ST3:** As a customer, I want to download my statement as a PDF so that I can share it with a third party (employer, landlord, etc.).

---

## Beneficiaries

**US-B1:** As a customer, I want to save a frequent recipient as a beneficiary with a nickname so that I can transfer to them quickly without typing their account number each time.

**US-B2:** As a customer, I want to manage (add, edit, delete) my saved beneficiaries so that my list stays up to date.

**US-B3:** As a customer, I want to select a beneficiary directly from the transfer form so that the account number is pre-filled for me.

---

## Expenses

**US-E1:** As a customer, I want to log an expense with an amount, category, and date so that I can track my spending separately from transactions.

**US-E2:** As a customer, I want to view my monthly and yearly spending analytics by category so that I understand where my money goes.

**US-E3:** As a customer, I want to view a spending dashboard with total spent this month, top category, and trend so that I have a quick financial health snapshot.

---

## AI Assistant (Phase 11)

**US-AI1:** As a customer, I want to ask the AI assistant questions about my accounts and transactions so that I get instant, personalised answers without calling support.

**US-AI2:** As a customer, I want the AI chat history to persist as I navigate between pages so that I don't lose my conversation mid-flow.

**US-AI3:** As a customer, I want the AI to answer based on my actual balance and spending data so that the answers are relevant to me, not generic.

**US-AI4:** As a customer, I want the AI to respond naturally without repeating disclaimers on every message so that the conversation feels useful rather than defensive.

**US-AI5:** As a customer, I want the AI chat to be cleared when I log out so that my financial data is not exposed on a shared device.

---

## Admin & Staff

**US-ADM1:** As an admin, I want to create banker accounts so that new staff can access the system.

**US-ADM2:** As an admin, I want to update or deactivate a staff member's account so that access is controlled when staff leave or change roles.

**US-ADM3:** As an admin, I want to view all audit logs filtered by user, action, and date so that I can investigate any incident.

**US-ADM4:** As a banker, I want to view a customer's full activity log so that I can assist them with queries or identify suspicious behaviour.

