const cron = require("node-cron");
const Account = require("../../shared/models/Account");
const { ACCOUNT_STATUS } = require("../../shared/constants/accounts");
const Transaction = require("../../shared/models/Transaction");
const { getNextReference } = require("../../shared/utils/reference");
const {
  sendNotification,
} = require("../../shared/services/notification.service");
const { getSavingsAnnualRate } = require("../../shared/constants/products");

// Runs at 23:59 on days 28–31; last-day check inside prevents double-runs
cron.schedule(
  "59 23 28-31 * *",
  async () => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const isLastDayOfMonth = tomorrow.getDate() === 1;
    if (!isLastDayOfMonth) return;

    console.log("[Cron] Savings interest job started:", now.toISOString());

    try {
      const accounts = await Account.find({
        status: ACCOUNT_STATUS.ACTIVE,
        accountType: "savings",
        balance: { $gte: 1 },
      });

      console.log(
        `[Cron] Savings interest: processing ${accounts.length} accounts`,
      );

      for (const account of accounts) {
        try {
          const annualRate = getSavingsAnnualRate(account.balance);
          const interest =
            Math.round(((account.balance * (annualRate / 100)) / 12) * 100) /
            100;

          if (interest <= 0) continue;

          const balanceBefore = account.balance;
          account.balance += interest;

          const reference = await getNextReference();
          const transaction = new Transaction({
            account: account._id,
            amount: interest,
            type: "interest",
            direction: "credit",
            description: "Monthly savings interest",
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

          try {
            await sendNotification({
              type: "interest_credited",
              title: "Interest Credited",
              message: `RM ${interest.toFixed(2)} interest has been credited to your Savings account ${account.accountNumber}.`,
              link: `/accounts/${account.accountNumber}`,
              recipient: {
                role: "customer",
                userId: account.user.toString(),
              },
              source: {
                service: "my-bank-api",
                id: transaction._id.toString(),
              },
              data: { amount: interest, accountNumber: account.accountNumber },
              read: false,
              delivered: false,
            });
          } catch (notifyErr) {
            console.error(
              "[Cron] Interest notification failed:",
              notifyErr.message,
            );
          }
        } catch (accountErr) {
          console.error(
            `[Cron] Savings interest failed for account ${account.accountNumber}:`,
            accountErr.message,
          );
        }
      }

      console.log("[Cron] Savings interest job completed");
    } catch (err) {
      console.error("[Cron] Savings interest job failed:", err.message);
    }
  },
  { timezone: "Asia/Kuala_Lumpur" },
);

console.log("[Cron] Savings interest job registered");
