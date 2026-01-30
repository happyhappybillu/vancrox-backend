const User = require("../models/User");

async function generateUID() {
  const last = await User.findOne({
    role: "investor",
    uid: { $exists: true, $ne: null }
  })
    .sort({ uid: -1 })
    .lean();

  if (!last || !last.uid) return 5000;
  return Number(last.uid) + 1;
}

async function generateTID() {
  const last = await User.findOne({
    role: "trader",
    tid: { $exists: true, $ne: null }
  })
    .sort({ tid: -1 })
    .lean();

  if (!last || !last.tid) return 5000;
  return Number(last.tid) + 1;
}

module.exports = { generateUID, generateTID };