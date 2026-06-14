const cron = require("node-cron");
const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const { getNextReference } = require("../../shared/utils/reference");
const { sendNotification } = require("../../shared/services/notification.service");
const { ACCOUNT_STATUS } = require("../../shared/constants/accountStatus");

// Interest rates (annual p.a.) from business-rules.md
const FD_RATES = {
  1: 0.025,
  3: 0.028,
  6: 0.031,
  12: 0.035,
};

// Runs daily at 03:00 AM
cron.schedule(
  "0 3 * * *",
  async () => {
    console.log("[Cron] FD Maturity Engine started:", new Date().toISOString());

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all active FD accounts that have matured
      const maturedFDs = await Account.find({
        status: ACCOUNT_STATUS.ACTIVE,
        accountType: "fixed_deposit",
        maturityDate: { $lte: today },
      });

      console.log(`[Cron] Processing ${maturedFDs.length} FD accounts`);

      for (const fd of maturedFDs) {
        try {
          const maturityDate = new Date(fd.maturityDate);
          const diffTime = Math.abs(today - maturityDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // 1. Grace Period Check (7 days)
          if (diffDays <= 7) {
            console.log(`[Cron] FD ${fd.accountNumber} in grace period (${diffDays} days). Waiting for customer action.`);
            continue;
          }

          // 2. Post-Grace Period: Settlement or Renewal
          if (fd.autoRenew) {
            // Logic for Auto-Renewal
            console.log(`[Cron] FD ${fd.accountNumber} maturing. Processing renewal.`);
            
            // Calculate interest and credit to linked account
            const interest = fd.principal * FD_RATES[fd.lockPeriod] * (fd.lockPeriod / 12);
            
            // Perform credit transfer
            const linkedAccount = await Account.findOne({ accountNumber: fd.linkedAccount });
            if (!linkedAccount) throw new Error("Linked account not found");

            const balanceBefore = linkedAccount.balance;
            linkedAccount.balance += (fd.principal + interest);
            await linkedAccount.save();

            // Create Transaction record
            const reference = await getNextReference();
            await Transaction.create({
              account: linkedAccount._id,
              amount: (fd.principal + interest),
              type: "credit",
              direction: "credit",
              description: `FD Maturity Settlement: ${fd.accountNumber}`,
              reference,
              currency: "MYR",
              status: "completed",
            });

            // Update FD for new period
            fd.dateOpened = today.toISOString();
            const newMaturity = new Date(today);
            newMaturity.setMonth(newMaturity.getMonth() + fd.lockPeriod);
            fd.maturityDate = newMaturity.toISOString();
            await fd.save();

            await sendNotification({
                type: "fd_renewed",
                title: "FD Renewed",
                message: `Your FD ${fd.accountNumber} has matured. Principal + Interest credited to ${fd.linkedAccount}. Account renewed for ${fd.lockPeriod} months.`,
                recipient: { userId: fd.user.toString() },
            });

          } else {
            // Maturity without renewal
            console.log(`[Cron] FD ${fd.accountNumber} maturing. No auto-renewal.`);
            
            const interest = fd.principal * FD_RATES[fd.lockPeriod] * (fd.lockPeriod / 12);
            
            const linkedAccount = await Account.findOne({ accountNumber: fd.linkedAccount });
            if (linkedAccount) {
                linkedAccount.balance += (fd.principal + interest);
                await linkedAccount.save();
            }

            fd.status = "closed";
            await fd.save();
          }

        } catch (err) {
          console.error(`[Cron] Error processing FD ${fd.accountNumber}:`, err.message);
        }
      }
    } catch (err) {
      console.error("[Cron] FD Maturity Engine failed:", err.message);
    }
  },
  { timezone: "Asia/Kuala_Lumpur" }
);

console.log("[Cron] FD Maturity Engine registered");
