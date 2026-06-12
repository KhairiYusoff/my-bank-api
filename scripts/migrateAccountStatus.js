/**
 * Migration: Normalise Account.status to lowercase snake_case.
 *
 * Before (old enum):  "Active" | "Dormant" | "Closed"
 * After  (new enum):  "active" | "dormant" | "closed" (+ pending_approval, suspended, pending_closure unused until set by app)
 *
 * Usage:
 *   node scripts/migrateAccountStatus.js
 *
 * Safe to re-run — already-normalised values are left unchanged.
 */

require("dotenv").config();
const mongoose = require("mongoose");

const STATUS_MAP = {
  Active: "active",
  Dormant: "dormant",
  Closed: "closed",
};

async function run() {
  const uri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGO_URI (or MONGODB_URI) is not set in .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const collection = mongoose.connection.collection("accounts");
  let total = 0;

  for (const [from, to] of Object.entries(STATUS_MAP)) {
    const result = await collection.updateMany(
      { status: from },
      { $set: { status: to } },
    );
    console.log(`  ${from} → ${to}: ${result.modifiedCount} document(s) updated`);
    total += result.modifiedCount;
  }

  const KNOWN_STATUSES = [
    ...Object.values(STATUS_MAP),
    "pending_approval",
    "suspended",
    "pending_closure",
  ];
  const unknown = await collection.distinct("status", {
    status: { $nin: KNOWN_STATUSES },
  });
  if (unknown.length > 0) {
    console.warn("\nWarning: unexpected status values still in DB:", unknown);
  }

  console.log(`\nMigration complete. Total updated: ${total}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
