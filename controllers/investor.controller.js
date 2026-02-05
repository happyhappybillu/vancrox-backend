const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

// profile
exports.profile = async (req, res) => {
  res.json({ success: true, investor: req.user });
};

// ✅ Top Traders (active ads only)
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

// ✅ Hire Trader (FIXED FLOW)
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

    // ❗ low balance rule
    if (investor.balance < ad.tradeAmount) {
      return res.status(400).json({ message: "Low balance" });
    }

    // 🔒 deduct balance
    investor.balance -= ad.tradeAmount;
    await investor.save();

    // create hire trade
    const hire = await HireTrade.create({
      investorId: investor._id,
      traderId: ad.traderId,
      traderAdId: ad._id,
      amount: ad.tradeAmount,
      status: "ONGOING",
      profitPercent: ad.profitPercent,
    });

    // ❌ remove ad from listing
    ad.isActive = false;
    await ad.save();

    // transaction record
    await Transaction.create({
      userId: investor._id,
      type: "TRADE",
      amount: ad.tradeAmount,
      status: "LOCKED",
      note: `Trade${ad.tradeAmount}$ started`,
    });

    res.json({
      success: true,
      message: "Trader hired successfully",
      hire,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ My Traders (ongoing + completed)
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

// ✅ History (ONLY allowed types)
exports.history = async (req, res) => {
  try {
    const tx = await Transaction.find({
      userId: req.user._id,
      type: { $in: ["DEPOSIT", "WITHDRAW", "PROFIT"] },
    }).sort({ createdAt: -1 });

    res.json({ success: true, tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};