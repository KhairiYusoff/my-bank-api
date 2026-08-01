const cron = require("node-cron");
const Account = require("../../shared/models/Account");
const Transaction = require("../../shared/models/Transaction");
const { getNextReference } = require("../../shared/utils/reference");
const { sendNotification } = require("../../shared/services/notification.service");
const { ACCOUNT_STATUS } = require("../../shared/constants/accountStatus");
const { getFDRateDecimal } = require("../../shared/constants/products");

// Runs daily at 03:00 AM
cron.schedule(
  "0 3 * * *",
  async () => {
    console.log("[Cron] FD Maturity Engine started:", new Date().toISOString());

    const session = await Account.startSession();
    session.startTransaction();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all active FD accounts that are matured or past maturity
      const fds = await Account.find({
        status: ACCOUNT_STATUS.ACTIVE,
        accountType: "fixed_deposit",
        maturityDate: { $lte: today },
      }).session(session);

      console.log(`[Cron] Checking ${fds.length} FD accounts for maturity actions`);

      for (const fd of fds) {
        try {
          const maturityDate = new Date(fd.maturityDate);
          maturityDate.setHours(0, 0, 0, 0);
          
          const diffTime = today.getTime() - maturityDate.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

          // BRANCH A: Day 0 (Maturity Date) - Payout Interest
          if (diffDays >= 0 && !fd.interestPaid) {
            console.log(`[Cron] FD ${fd.accountNumber} matured today. Processing interest payout.`);
            
            const interest = fd.principal * getFDRateDecimal(fd.lockPeriod) * (fd.lockPeriod / 12);
            
            const linkedAccount = await Account.findById(fd.linkedAccount).session(session);
            if (linkedAccount) {
              const balanceBefore = linkedAccount.balance;
              linkedAccount.balance += interest;
              await linkedAccount.save({ session });

              const reference = await getNextReference();
              await Transaction.create([{
                account: linkedAccount._id,
                amount: interest,
                type: "credit",
                direction: "credit",
                description: `FD Interest Payout: ${fd.accountNumber}`,
                reference,
                currency: "MYR",
                status: "completed",
                balanceBefore,
                balanceAfter: linkedAccount.balance
              }], { session });

              fd.interestPaid = true;
              fd.lastMaturityProcessed = today;
              await fd.save({ session });

              await sendNotification({
                type: "fd_interest_paid",
                title: "FD Interest Received",
                message: `Interest of RM${interest.toFixed(2)} from your FD ${fd.accountNumber} has been credited to ${linkedAccount.accountNumber}.`,
                recipient: { userId: fd.user.toString() },
              });
            }
          }

          // BRANCH B: Day 8 (Post-Grace Period) - Auto-Renewal or Settlement
          if (diffDays >= 8) {
            if (fd.autoRenew) {
              console.log(`[Cron] FD ${fd.accountNumber} grace period over. Processing renewal.`);
              
              // Renewal logic: Reset lock period
              fd.dateOpened = today;
              const newMaturity = new Date(today);
              newMaturity.setMonth(newMaturity.getMonth() + fd.lockPeriod);
              fd.maturityDate = newMaturity;
              fd.interestPaid = false; // Ready for next maturity
              await fd.save({ session });

              await sendNotification({
                type: "fd_renewed",
                title: "FD Auto-Renewed",
                message: `Your FD ${fd.accountNumber} has been renewed for another ${fd.lockPeriod} months.`,
                recipient: { userId: fd.user.toString() },
              });
            } else {
              console.log(`[Cron] FD ${fd.accountNumber} grace period over. Processing final settlement.`);
              
              const linkedAccount = await Account.findById(fd.linkedAccount).session(session);
              if (linkedAccount) {
                const balanceBefore = linkedAccount.balance;
                linkedAccount.balance += fd.principal;
                await linkedAccount.save({ session });

                const reference = await getNextReference();
                await Transaction.create([{
                  account: linkedAccount._id,
                  amount: fd.principal,
                  type: "credit",
                  direction: "credit",
                  description: `FD Principal Settlement: ${fd.accountNumber}`,
                  reference,
                  currency: "MYR",
                  status: "completed",
                  balanceBefore,
                  balanceAfter: linkedAccount.balance
                }], { session });

                fd.status = "closed";
                fd.balance = 0;
                await fd.save({ session });

                await sendNotification({
                  type: "fd_settled",
                  title: "FD Settled & Closed",
                  message: `Your FD ${fd.accountNumber} has been settled. Principal of RM${fd.principal.toFixed(2)} credited to ${linkedAccount.accountNumber}.`,
                  recipient: { userId: fd.user.toString() },
                });
              }
            }
          }

          if (diffDays > 0 && diffDays <= 7) {
            console.log(`[Cron] FD ${fd.accountNumber} is in grace period (Day ${diffDays}).`);
          }

        } catch (err) {
          console.error(`[Cron] Error processing FD ${fd.accountNumber}:`, err.message);
          // Don't throw, continue with other FDs
        }
      }

      await session.commitTransaction();
      console.log("[Cron] FD Maturity Engine completed successfully");
    } catch (err) {
      await session.abortTransaction();
      console.error("[Cron] FD Maturity Engine failed:", err.message);
    } finally {
      session.endSession();
    }
  },
  { timezone: "Asia/Kuala_Lumpur" }
);

console.log("[Cron] FD Maturity Engine registered");
