const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

/* =========================
   HELPERS
========================= */

async function securityBalance(userId) {
  const tx = await Transaction.aggregate([
    { $match: { userId, type: "SECURITY", status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } }
  ]);
  return tx?.[0]?.total || 0;
}

function requireHistoryApproved(user) {
  if (user.tradingHistoryStatus !== "APPROVED") {
    return {
      ok: false,
      message: "Trading history not approved yet"
    };
  }
  return { ok: true };
}

async function requireUnlocked(user) {
  const historyCheck = requireHistoryApproved(user);
  if (!historyCheck.ok) return historyCheck;

  const bal = await securityBalance(user._id);
  if (bal < 100) {
    return {
      ok: false,
      message: "Please deposit minimum 100 USDT security money to unlock all features"
    };
  }
  return { ok: true, bal };
}

/* =========================
   PROFILE
========================= */

exports.profile = async (req, res) => {
  res.json({ success: true, trader: req.user });
};

/* =========================
   1️⃣ TRADING HISTORY
========================= */

exports.uploadTradingHistory = async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || images.length === 0) {
      return res.status(400).json({ message: "Upload trading history images" });
    }

    req.user.tradingHistoryImages = images;
    req.user.tradingHistoryStatus = "PENDING";
    await req.user.save();

    res.json({
      success: true,
      message: "Trading history submitted. Status: Pending review by system team"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   2️⃣ SECURITY MONEY
========================= */

exports.securityDeposit = async (req, res) => {
  try {
    const historyCheck = requireHistoryApproved(req.user);
    if (!historyCheck.ok) {
      return res.status(403).json({ message: historyCheck.message });
    }

    const { amount } = req.body;
    if (!amount || Number(amount) < 100) {
      return res.status(400).json({ message: "Minimum security deposit is 100 USDT" });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "SECURITY",
      amount: Number(amount),
      status: "PENDING",
      note: "Security money deposit request"
    });

    res.json({
      success: true,
      message: "Security deposit submitted. Pending verification",
      tx
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   3️⃣ CREATE AD (RUN AD FREE)
========================= */

exports.createAd = async (req, res) => {
  try {
    const unlock = await requireUnlocked(req.user);
    if (!unlock.ok) {
      return res.status(403).json({ message: unlock.message });
    }

    const level = req.user.level || 1;
    const activeAds = await TraderAd.countDocuments({
      traderId: req.user._id,
      isActive: true
    });

    if (activeAds >= level) {
      return res.status(403).json({
        message: `Your level allows only ${level} active ads`
      });
    }

    const { profitPercent } = req.body;
    if (!profitPercent || Number(profitPercent) <= 0) {
      return res.status(400).json({ message: "Invalid return percentage" });
    }

    const secBal = unlock.bal;

    const ad = await TraderAd.create({
      traderId: req.user._id,
      amount: secBal,
      profitPercent: Number(profitPercent),
      isActive: true
    });

    res.json({ success: true, ad });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   4️⃣ MY ADS
========================= */

exports.myAds = async (req, res) => {
  try {
    const unlock = await requireUnlocked(req.user);
    if (!unlock.ok) {
      return res.status(403).json({ message: unlock.message });
    }

    const ads = await TraderAd.find({ traderId: req.user._id })
      .sort({ createdAt: -1 });

    res.json({ success: true, ads });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   5️⃣ INVENTORY
========================= */

exports.inventory = async (req, res) => {
  try {
    const unlock = await requireUnlocked(req.user);
    if (!unlock.ok) {
      return res.status(403).json({ message: unlock.message });
    }

    const items = await HireTrade.find({ traderId: req.user._id })
      .populate("investorId", "name uid")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   6️⃣ CONFIRM / REJECT (NEW)
========================= */

exports.confirmHire = async (req, res) => {
  try {
    const { hireId } = req.body;
    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
      status: "WAITING_TRADER_CONFIRMATION"
    });

    if (!hire) {
      return res.status(404).json({ message: "Invalid request" });
    }

    hire.status = "HIRED";
    await hire.save();

    res.json({
      success: true,
      message: "Trade confirmed. Amount credited to your wallet"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectHire = async (req, res) => {
  try {
    const { hireId } = req.body;
    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
      status: "WAITING_TRADER_CONFIRMATION"
    });

    if (!hire) {
      return res.status(404).json({ message: "Invalid request" });
    }

    hire.status = "REJECTED";
    await hire.save();

    await Transaction.create({
      userId: hire.investorId,
      type: "REFUND",
      amount: hire.amount,
      status: "SUCCESS",
      note: `Trade rejected by trader. HireId:${hire._id}`
    });

    res.json({
      success: true,
      message: "Trade rejected. Investor refunded instantly"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   7️⃣ PROFIT / LOSS
========================= */

exports.selectLoss = async (req, res) => {
  try {
    const { hireId } = req.body;
    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
      status: "HIRED"
    });

    if (!hire) return res.status(404).json({ message: "Invalid trade" });

    hire.status = "LOSS";
    await hire.save();

    await Transaction.create({
      userId: hire.investorId,
      type: "REFUND",
      amount: hire.amount,
      status: "SUCCESS",
      note: `Loss refund. HireId:${hire._id}`
    });

    const secBal = await securityBalance(req.user._id);
    if (secBal > 0) {
      await Transaction.create({
        userId: req.user._id,
        type: "SECURITY",
        amount: -secBal,
        status: "SUCCESS",
        note: "Security forfeited due to loss"
      });
    }

    res.json({
      success: true,
      message: "Loss selected. Investor refunded. Security reset to 0"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectProfit = async (req, res) => {
  try {
    const { hireId } = req.body;
    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
      status: "HIRED"
    });

    if (!hire) return res.status(404).json({ message: "Invalid trade" });

    const profit = (hire.amount * hire.profitPercent) / 100;
    const fee = profit * 0.10;
    const investorGets = hire.amount + (profit - fee);

    hire.status = "PROFIT_SELECTED";
    hire.profitAmount = profit;
    hire.traderEarning = fee;
    await hire.save();

    await Transaction.create({
      userId: hire.investorId,
      type: "PROFIT",
      amount: investorGets,
      status: "SUCCESS",
      note: `Profit credited instantly. HireId:${hire._id}`
    });

    res.json({
      success: true,
      message: "Profit selected. Investor credited instantly"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   8️⃣ UPLOAD PROFIT PROOF
========================= */

exports.uploadProof = async (req, res) => {
  try {
    const { hireId, proofImage } = req.body;

    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
      status: "PROFIT_SELECTED"
    });

    if (!hire) return res.status(404).json({ message: "Invalid trade" });

    hire.proofImage = proofImage;
    hire.status = "PROOF_PENDING";
    await hire.save();

    res.json({
      success: true,
      message: "Profit proof submitted. Pending verification"
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};