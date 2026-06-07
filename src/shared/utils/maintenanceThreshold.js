const { sendNotification } = require("../services/notification.service");

const MAINTENANCE_THRESHOLDS = {
  savings: 1000,
  current: 2000,
  business: 5000,
};

function getMaintenanceThreshold(accountType) {
  return MAINTENANCE_THRESHOLDS[accountType] ?? null;
}

function isBelowMaintenanceThreshold(accountType, balance) {
  const threshold = getMaintenanceThreshold(accountType);
  if (threshold === null) return false;
  return balance < threshold;
}

async function notifyBelowThreshold(account) {
  const threshold = getMaintenanceThreshold(account.accountType);
  if (threshold === null) return;
  if (account.balance >= threshold) return;

  try {
    await sendNotification({
      type: "balance_warning",
      title: "Low Balance Alert",
      message: `Your ${account.accountType} account (${account.accountNumber}) balance is RM ${account.balance.toFixed(2)}, which is below the RM ${threshold.toLocaleString()} minimum. A monthly maintenance fee may apply.`,
      link: `/accounts/${account.accountNumber}`,
      recipient: { role: "customer", userId: account.user.toString() },
      source: { service: "my-bank-api", id: account._id.toString() },
      data: {
        accountNumber: account.accountNumber,
        balance: account.balance,
        threshold,
      },
      read: false,
      delivered: false,
    });
  } catch (err) {
    console.error("[Notify] Failed to send low balance alert:", err.message);
  }
}

module.exports = {
  getMaintenanceThreshold,
  isBelowMaintenanceThreshold,
  notifyBelowThreshold,
};
