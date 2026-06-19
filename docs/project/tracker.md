# Active Task Tracker

> **Scope:** Active Phase development and immediate technical/infrastructure tasks. 
> Statuses here are references to the [Master Stories Index](../product/user-stories.md). Historical logs live in [roadmap.md](roadmap.md).

**Last Updated:** June 19, 2026  
**Current Phase:** Phase 10 — Account Dormancy & Lifecycle  

---

## 1. Active Focus: Phase 10 User Stories

Detailed Acceptance Criteria are documented in `docs/user-stories/phase-10/`.

| Story | Repos | Summary / Scope | AC Link |
| :--- | :--- | :--- | :--- |
| **US-10001** | `my-bank-api`, `my-bank-customer` | Automated Dormancy Engine — Scans for 12 months inactivity at 02:00 MYT, blocks customer transactions, shows Dormant UI. | [US-10001.md](../user-stories/phase-10/US-10001.md) |
| **US-10002** | `my-bank-api` | Dormancy Maintenance Fees — Debits RM10/year on anniversary of dormancy. | [US-10002.md](../user-stories/phase-10/US-10002.md) |
| **US-10003** | `my-bank-api`, `my-bank-admin-portal` | Administrative Lifecycle Controls — Banker suspension and reactivation endpoints & detail page actions. | [US-10003.md](../user-stories/phase-10/US-10003.md) |
| **US-10004** | `my-bank-api`, `my-bank-customer`, `my-bank-admin-portal` | Managed Account Closure — Customer requests closure, banker approves after verifying balance is zero. | [US-10004.md](../user-stories/phase-10/US-10004.md) |
| **US-10005** | `my-bank-api` | Early Account Closure Penalty — Charges RM20 early closure fee if closed within 3 months. | [US-10005.md](../user-stories/phase-10/US-10005.md) |
| **US-10006** | `my-bank-api`, `notification-service` | Lifecycle Event Notifications — Dispatches warnings and alerts for dormancy, suspension, and closure. | [US-10006.md](../user-stories/phase-10/US-10006.md) |

---

## 2. Tech Debt — Enum Normalisation

Resolve issues with out-of-sync enums between codebase, documentation, and database.

| Item | Code today | Target (`business-rules.md`) | Status / Action |
| :--- | :--- | :--- | :--- |
| `Account.accountType` | `Savings` / `Checking` / `Business` | `savings` / `current` / `business` / `fixed_deposit` | ✅ Dev DB migrated (22 records). Re-run `node scripts/migrateAccountTypes.js` on staging/prod. |
| `Account.status` | `Active` / `Dormant` / `Closed` | `pending_approval` / `active` / `dormant` / `suspended` / `closed` / `pending_closure` | ✅ Code migrated. Run `node scripts/migrateAccountStatus.js` on each DB. |
| `schema-overview.md` | Stale (missing `auditor`) | Match live models | Status enum updated; auditor role still pending in schema doc. |

*Note: FD `matured` status is not an account lifecycle status. Track FD product state via `maturityDate` or `fdMaturedAt` (US-9003).*

---

## 3. Performance Backlog

| Item | Description | Impact |
| :--- | :--- | :--- |
| **P1** | Remove redundant `User.findById` inside `authorizeRoles` middleware, as `req.user` is already populated by `authMiddleware`. | Medium |
| **P2** | Implement automatic route loading in `server.js` to simplify adding new endpoints. | Low |

---

## 4. Infrastructure Task — API Migration (Render to Fly.io)

**Goal:** Ensure cron reliability. Render's free tier sleeps after 15 minutes of inactivity, causing missed `node-cron` executions (e.g., US-7006 maintenance fees, US-7007 savings interest). 

Fly.io VMs run continuously without forced sleep, ensuring standard crons execute reliably.

### Migration Action Plan (Fly.io)
```bash
# 1. Install flyctl
brew install flyctl

# 2. Login
fly auth login

# 3. Launch & configure from my-bank-api root (uses existing Dockerfile)
fly launch
fly secrets set PORT=5000 MONGO_URI=... JWT_SECRET=...

# 4. Deploy
fly deploy

# 5. Update clients
# Point my-bank-customer and my-bank-admin-portal environment variables to the new Fly.io API URL.
```
