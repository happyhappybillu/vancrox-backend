const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

/* ======================================================
   HELPERS
====================================================== */

// trader security balance
async function getSecurityBalance(traderId) {
  const tx = await Transaction.aggregate([
    { $match: { userId: traderId, type: "SECURITY", status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return tx?.[0]?.total || 0;
}

// check trader unlocked
async function ensureUnlocked(trader) {
  if (!trader.isHistoryApproved) {
    return { ok: false, message: "Trading history not approved" };
  }
  const sec = await getSecurityBalance(trader._id);
  if (sec < 100) {
    return { ok: false, message: "Minimum 100 USDT security required" };
  }
  return { ok: true, security: sec };
}

/* ======================================================
   PROFILE
====================================================== */
exports.profile = async (req, res) => {
  res.json({ success: true, trader: req.user });
};

/* ======================================================
   SECURITY DEPOSIT
====================================================== */
exports.securityDeposit = async (req, res) => {
  try {
    const { amount, proof } = req.body;
    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Minimum 100 required" });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "SECURITY",
      amount,
      proof: proof || "",
      status: "PENDING",
      note: "Security deposit request",
    });

    res.json({ success: true, message: "Security request sent", tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   CREATE AD (LIMITED BY SECURITY)
====================================================== */
exports.createAd = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const { profitPercent } = req.body;
    const security = check.security;

    const ad = await TraderAd.create({
      traderId: req.user._id,
      title: "Trader Ad",
      description: "",
      minAmount: security,
      maxAmount: security,
      profitPercent: Number(profitPercent || 25),
      isActive: true,
    });

    res.json({ success: true, ad });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   MY ADS
====================================================== */
exports.myAds = async (req, res) => {
  const ads = await TraderAd.find({ traderId: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, ads });
};

/* ======================================================
   INVENTORY (WAITING / ACTIVE / PROFIT / LOSS)
====================================================== */
exports.inventory = async (req, res) => {
  const list = await HireTrade.find({ traderId: req.user._id })
    .populate("investorId", "name uid")
    .sort({ createdAt: -1 });

  res.json({ success: true, list });
};

/* ======================================================
   CONFIRM / REJECT HIRE (MOST IMPORTANT)
====================================================== */
exports.confirmHire = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findOne({
      _id: hireId,
      traderId: req.user._id,
    });

    if (!hire) return res.status(404).json({ message: "Invalid hire" });
    if (hire.status !== "WAITING_TRADER_CONFIRMATION") {
      return res.status(400).json({ message: "Already processed" });
    }

    hire.status = "ACTIVE";
    hire.traderConfirmation = "CONFIRMED";
    hire.traderConfirmedAt = new Date();
    await hire.save();

    res.json({ success: true, message: "Trade confirmed" });
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
    });

    if (!hire) return res.status(404).json({ message: "Invalid hire" });
    if (hire.status !== "WAITING_TRADER_CONFIRMATION") {
      return res.status(400).json({ message: "Already processed" });
    }

    hire.status = "REJECTED_BY_TRADER";
    hire.traderConfirmation = "REJECTED";
    hire.closedAt = new Date();
    await hire.save();

    // refund investor instantly
    await Transaction.create({
      userId: hire.investorId,
      type: "REFUND",
      amount: hire.amount,
      status: "SUCCESS",
      note: `Trade rejected by trader. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Trade rejected & refunded" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   PROFIT / LOSS
====================================================== */
exports.selectLoss = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire || hire.status !== "ACTIVE") {
      return res.status(400).json({ message: "Invalid trade" });
    }

    hire.status = "LOSS_SELECTED";
    hire.closedAt = new Date();
    await hire.save();

    // refund investor
    await Transaction.create({
      userId: hire.investorId,
      type: "REFUND",
      amount: hire.amount,
      status: "SUCCESS",
      note: `Loss refund. HireId:${hire._id}`,
    });

    // reset trader security
    const sec = await getSecurityBalance(req.user._id);
    if (sec > 0) {
      await Transaction.create({
        userId: req.user._id,
        type: "SECURITY",
        amount: -sec,
        status: "SUCCESS",
        note: "Security forfeited (loss)",
      });
    }

    res.json({ success: true, message: "Loss processed" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectProfit = async (req, res) => {
  try {
    const { hireId, profitPercent } = req.body;

    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire || hire.status !== "ACTIVE") {
      return res.status(400).json({ message: "Invalid trade" });
    }

    const percent = Number(profitPercent);
    const profit = (hire.amount * percent) / 100;
    const fee = profit * 0.1;

    hire.status = "PROFIT_SELECTED";
    hire.profitPercent = percent;
    hire.profitAmount = profit;
    hire.investorCreditAmount = hire.amount + (profit - fee);
    hire.traderEarning = fee;
    await hire.save();

    // instant credit investor
    await Transaction.create({
      userId: hire.investorId,
      type: "PROFIT_CREDIT",
      amount: hire.investorCreditAmount,
      status: "SUCCESS",
      note: `Profit credited. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Profit selected & investor credited" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   UPLOAD PROFIT PROOF
====================================================== */
exports.uploadProof = async (req, res) => {
  try {
    const { hireId, proofImage } = req.body;

    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire || hire.status !== "PROFIT_SELECTED") {
      return res.status(400).json({ message: "Invalid trade" });
    }

    hire.proofImage = proofImage;
    hire.status = "PROOF_PENDING";
    await hire.save();

    res.json({ success: true, message: "Proof submitted (pending approval)" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};