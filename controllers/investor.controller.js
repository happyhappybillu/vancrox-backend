const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

/* ===============================
   INVESTOR PROFILE
================================ */
exports.profile = async (req, res) => {
  res.json({ success: true, investor: req.user });
};

/* ===============================
   TOP TRADERS (ADS)
================================ */
exports.topTraders = async (req, res) => {
  try {
    const ads = await TraderAd.find({ isActive: true })
      .populate("traderId", "name tid traderLevel")
      .sort({ createdAt: -1 });

    res.json({ success: true, ads });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   HIRE TRADER (FINAL FLOW)
================================ */
exports.hireTrader = async (req, res) => {
  try {
    const { traderAdId } = req.body;

    if (!traderAdId) {
      return res.status(400).json({ message: "Invalid request" });
    }

    const ad = await TraderAd.findById(traderAdId);
    if (!ad || !ad.isActive) {
      return res.status(404).json({ message: "Trader ad not available" });
    }

    const investor = await User.findById(req.user._id);
    if (investor.balance < ad.minAmount) {
      return res.status(400).json({ message: "Low balance" });
    }

    /* 🔒 INSTANT BALANCE CUT */
    investor.balance -= ad.minAmount;
    await investor.save();

    /* 🔹 CREATE HIRE TRADE */
    const hire = await HireTrade.create({
      investorId: investor._id,
      traderId: ad.traderId,
      traderAdId: ad._id,
      amount: ad.minAmount,
      status: "WAITING_TRADER_CONFIRMATION",
      profitPercent: ad.profitPercent,
    });

    /* 🔹 TRANSACTION LOG */
    await Transaction.create({
      userId: investor._id,
      type: "HIRE",
      amount: ad.minAmount,
      status: "SUCCESS",
      note: "Amount locked for trader confirmation",
    });

    res.json({
      success: true,
      message: "Waiting for trader confirmation",
      hire,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===============================
   MY TRADERS (ALL STATES)
================================ */
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

/* ===============================
   HISTORY
================================ */
exports.history = async (req, res) => {
  try {
    const tx = await Transaction.find({
      userId: req.user._id,
      type: { $in: ["DEPOSIT", "WITHDRAW", "HIRE", "PROFIT_CREDIT", "REFUND"] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};