/**
 * Migration: Normalise Account.accountType to canonical lowercase codes.
 *
 * Before (old enum):  "Savings" | "Checking" | "Business"
 * After  (new enum):  "savings" | "current"  | "business" | "fixed_deposit"
 *
 * Usage:
 *   node scripts/migrateAccountTypes.js
 *
 * Safe to re-run — already-normalised values are left unchanged.
 */

require("dotenv").config();
const mongoose = require("mongoose");

const TYPE_MAP = {
  Savings: "savings",
  Checking: "current",
  Business: "business",
};

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGO_URI (or MONGODB_URI) is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  let total = 0;
  for (const [from, to] of Object.entries(TYPE_MAP)) {
    const result = await mongoose.connection
      .collection("accounts")
      .updateMany({ accountType: from }, { $set: { accountType: to } });
    console.log(
      `  ${from} → ${to}: ${result.modifiedCount} document(s) updated`,
    );
    total += result.modifiedCount;
  }

  console.log(`\nMigration complete. Total updated: ${total}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
