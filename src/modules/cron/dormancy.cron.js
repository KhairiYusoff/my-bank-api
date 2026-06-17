const cron = require("node-cron");
const accountService = require("../accounts/account.service");

// Daily cron at 02:00 MYT (scheduled before FD maturity processing at 03:00)

cron.schedule(
  "0 2 * * *",
  async () => {
    console.log("[CRON] Running Dormancy Identification Engine...");
    try {
      const results = await accountService.identifyDormantAccounts();
      console.log(
        `[CRON] Dormancy Engine Complete: ${results.dormant} marked dormant, ${results.warned} warnings sent.`,
      );
    } catch (err) {
      console.error("[CRON] Dormancy Engine Failed:", err.message);
    }
  },
  {
    timezone: "Asia/Kuala_Lumpur",
  },
);
