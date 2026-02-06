const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// =======================
// PROFILE
// =======================
exports.profile = async (req, res) => {
  res.json({ success: true, investor: req.user });
};

// =======================
// TOP TRADERS (ACTIVE ADS)
// =======================
exports.topTraders = async (req, res) => {
  try {
    const ads = await TraderAd.find({ isActive: true })
      .populate("traderId", "name tid")
      .sort({ createdAt: -1 });

    res.json({ success: true, ads });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// HIRE TRADER (FINAL FLOW)
// =======================
exports.hireTrader = async (req, res) => {
  try {
    const { traderAdId, amount } = req.body;

    if (!traderAdId || !amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const ad = await TraderAd.findById(traderAdId);
    if (!ad || !ad.isActive) {
      return res.status(404).json({ message: "Trader ad not available" });
    }

    // amount range check
    if (Number(amount) < ad.minAmount || Number(amount) > ad.maxAmount) {
      return res.status(400).json({ message: "Invalid trade amount" });
    }

    // 🔹 create hire trade (WAITING FOR TRADER CONFIRM)
    const hire = await HireTrade.create({
      investorId: req.user._id,
      traderId: ad.traderId,
      traderAdId: ad._id,
      amount: Number(amount),
      status: "WAITING_TRADER_CONFIRM",
      profitPercent: ad.profitPercent,
    });

    // 🔹 lock investor amount (record only – balance handled via transactions)
    await Transaction.create({
      userId: req.user._id,
      type: "HIRE",
      amount: Number(amount),
      status: "SUCCESS",
      note: `Hire requested. Waiting for trader confirmation. HireId:${hire._id}`,
    });

    res.json({
      success: true,
      message: "Hire request sent. Waiting for trader confirmation.",
      hire,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// MY INVENTORY (INVESTOR)
// =======================
exports.myTraders = async (req, res) => {
  try {
    const list = await HireTrade.find({ investorId: req.user._id })
      .populate("traderId", "name tid")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// =======================
// INVESTOR HISTORY
// =======================
exports.history = async (req, res) => {
  try {
    const tx = await Transaction.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};