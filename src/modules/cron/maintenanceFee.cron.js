const cron = require("node-cron");
const Account = require("../../shared/models/Account");
const { ACCOUNT_STATUS } = require("../../shared/constants/accountStatus");
const Transaction = require("../../shared/models/Transaction");
const { getNextReference } = require("../../shared/utils/reference");
const {
  sendNotification,
} = require("../../shared/services/notification.service");
const {
  notifyBelowThreshold,
} = require("../../shared/utils/maintenanceThreshold");
const { MAINTENANCE_FEE_RULES } = require("../../shared/constants/products");

// Runs at 00:01 on the 1st of every month
cron.schedule(
  "1 0 1 * *",
  async () => {
    console.log(
      "[Cron] Maintenance fee job started:",
      new Date().toISOString(),
    );

    try {
      const accounts = await Account.find({
        status: ACCOUNT_STATUS.ACTIVE,
        accountType: { $in: ["savings", "current", "business"] },
      });

      console.log(
        `[Cron] Maintenance fee: processing ${accounts.length} accounts`,
      );

      for (const account of accounts) {
        try {
          const rule = MAINTENANCE_FEE_RULES[account.accountType];
          if (!rule) continue;

          // Only charge if balance is below the maintenance threshold
          if (account.balance >= rule.threshold) continue;

          // Waive if balance is less than the fee itself
          if (account.balance < rule.fee) {
            console.warn(
              `[Cron] Fee waived for ${account.accountNumber} — balance RM${account.balance.toFixed(2)} < fee RM${rule.fee}`,
            );
            await notifyBelowThreshold(account);
            continue;
          }

          const balanceBefore = account.balance;
          account.balance -= rule.fee;

          const reference = await getNextReference();
          const transaction = new Transaction({
            account: account._id,
            amount: rule.fee,
            type: "fee",
            direction: "debit",
            description: "Monthly maintenance fee",
            reference,
            fee: 0,
            balanceBefore,
            balanceAfter: account.balance,
            currency: "MYR",
            channel: "system",
            status: "completed",
            performedBy: null,
            counterpartName: "MyBank",
            counterpartNameRaw: "MyBank",
          });

          await transaction.save();
          await account.save();

          // Low balance alert
          await notifyBelowThreshold(account);

          // Fee deducted notification
          try {
            await sendNotification({
              type: "fee_deducted",
              title: "Maintenance Fee Deducted",
              message: `RM ${rule.fee}.00 monthly maintenance fee has been deducted from account ${account.accountNumber}. Maintain a balance of RM ${rule.threshold.toLocaleString()} or above to waive this fee.`,
              link: `/accounts/${account.accountNumber}`,
              recipient: {
                role: "customer",
                userId: account.user.toString(),
              },
              source: {
                service: "my-bank-api",
                id: transaction._id.toString(),
              },
              data: {
                amount: rule.fee,
                accountNumber: account.accountNumber,
                threshold: rule.threshold,
              },
              read: false,
              delivered: false,
            });
          } catch (notifyErr) {
            console.error("[Cron] Fee notification failed:", notifyErr.message);
          }
        } catch (accountErr) {
          console.error(
            `[Cron] Maintenance fee failed for account ${account.accountNumber}:`,
            accountErr.message,
          );
        }
      }

      console.log("[Cron] Maintenance fee job completed");
    } catch (err) {
      console.error("[Cron] Maintenance fee job failed:", err.message);
    }
  },
  { timezone: "Asia/Kuala_Lumpur" },
);

console.log("[Cron] Maintenance fee job registered");
