const Counter = require("../models/Counter");

async function getNextReference() {
  const now = new Date();
  const myt = new Date(now.getTime() + 8 * 60 * 60 * 1000);
  const year = myt.getUTCFullYear();
  const month = String(myt.getUTCMonth() + 1).padStart(2, "0");
  const day = String(myt.getUTCDate()).padStart(2, "0");
  const dateKey = `${year}${month}${day}`;
  const counterId = `txn_${dateKey}`;

  const counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { upsert: true, new: true },
  );

  const seq = String(counter.seq).padStart(5, "0");
  return `TXN-${dateKey}-${seq}`;
}

module.exports = { getNextReference };
