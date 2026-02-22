const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const SystemAddress = require("../models/SystemAddress");
const WithdrawRequest = require("../models/WithdrawRequest");

/* ======================================================
   INVESTOR PROFILE
====================================================== */
exports.profile = async (req, res) => {
  try {
    const investor = await User.findById(req.user._id).select(
      "name email uid balance profilePhoto role"
    );

    res.json({ success: true, investor });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   TOP TRADERS (LIVE ADS)
====================================================== */
exports.topTraders = async (req, res) => {
  try {
    const ads = await TraderAd.find({ isActive: true })
      .populate("traderId", "name tid traderLevel profilePhoto")
      .sort({ createdAt: -1 });

    res.json({ success: true, ads });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   HIRE TRADER (CONFIRM ONLY FLOW)
====================================================== */
exports.hireTrader = async (req, res) => {
  try {
    const { traderAdId } = req.body;

    if (!traderAdId) {
      return res.status(400).json({ message: "TraderAd ID required" });
    }

    const ad = await TraderAd.findById(traderAdId);
    if (!ad || !ad.isActive) {
      return res.status(404).json({ message: "Trader ad not available" });
    }

    const investor = await User.findById(req.user._id);
    if (!investor) {
      return res.status(404).json({ message: "Investor not found" });
    }

    if (investor.balance < ad.tradeAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    /* 🔒 CUT BALANCE INSTANT */
    investor.balance -= ad.tradeAmount;
    await investor.save();

    /* 🔹 CREATE HIRE TRADE */
    const hire = await HireTrade.create({
      investorId: investor._id,
      traderId: ad.traderId,
      traderAdId: ad._id,
      amount: ad.tradeAmount,
      profitPercent: ad.profitPercent,
      status: "WAITING_TRADER_CONFIRMATION",
      traderConfirmation: "PENDING",
    });

    /* 🔹 TRANSACTION LOG */
    await Transaction.create({
      userId: investor._id,
      type: "HIRE",
      amount: ad.tradeAmount,
      status: "SUCCESS",
      note: "Amount locked – waiting for trader confirmation",
    });

    res.json({
      success: true,
      message: "Hire request sent. Waiting for trader confirmation.",
      hire,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MY TRADERS
====================================================== */
exports.myTraders = async (req, res) => {
  try {
    const list = await HireTrade.find({ investorId: req.user._id })
      .populate("traderId", "name tid profilePhoto")
      .populate("traderAdId", "profitPercent tradeAmount")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   TRANSACTION HISTORY
====================================================== */
exports.history = async (req, res) => {
  try {
    const tx = await Transaction.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, tx });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   WITHDRAW REQUEST
   ✔ Balance cut instantly
   ✔ Pending approval
====================================================== */
exports.withdrawRequest = async (req, res) => {
  try {
    const { amount, withdrawTo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!withdrawTo) {
      return res.status(400).json({ message: "Withdraw address required" });
    }

    const investor = await User.findById(req.user._id);

    if (investor.balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    /* 🔒 CUT BALANCE IMMEDIATELY */
    investor.balance -= amount;
    await investor.save();

    /* 🔹 CREATE WITHDRAW REQUEST */
    const request = await WithdrawRequest.create({
      investorId: investor._id,
      amount,
      withdrawTo,
      status: "PENDING",
    });

    /* 🔹 TRANSACTION LOG */
    await Transaction.create({
      userId: investor._id,
      type: "WITHDRAW",
      amount,
      status: "PENDING",
      withdrawTo,
    });

    res.json({
      success: true,
      message: "Withdraw request submitted. Pending approval.",
      request,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   SYSTEM DEPOSIT ADDRESSES
====================================================== */
exports.systemAddress = async (req, res) => {
  try {
    const addresses = await SystemAddress.findOne();

    res.json({
      success: true,
      addresses: addresses || {},
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load system addresses" });
  }
};

/* ======================================================
   SAVE WITHDRAWAL ADDRESS (INVESTOR PROFILE)
====================================================== */
exports.saveWithdrawAddress = async (req, res) => {
  try {
    const { erc20, trc20, bep20 } = req.body;

    const investor = await User.findById(req.user._id);

    investor.withdrawAddresses = {
      erc20: erc20 || "",
      trc20: trc20 || "",
      bep20: bep20 || "",
    };

    await investor.save();

    res.json({
      success: true,
      message: "Withdrawal addresses saved",
      addresses: investor.withdrawAddresses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save addresses" });
  }
};

/* ======================================================
   GET SAVED WITHDRAWAL ADDRESS
====================================================== */
exports.getWithdrawAddress = async (req, res) => {
  try {
    const investor = await User.findById(req.user._id);

    res.json({
      success: true,
      addresses: investor.withdrawAddresses || {},
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to load addresses" });
  }
};