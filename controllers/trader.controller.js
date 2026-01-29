const TraderAd = require("../models/TraderAd");
const HireTrade = require("../models/HireTrade");
const Transaction = require("../models/Transaction");
const User = require("../models/User");

async function securityBalance(userId) {
  const secTx = await Transaction.aggregate([
    { $match: { userId, type: "SECURITY", status: "SUCCESS" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  return secTx?.[0]?.total || 0;
}

async function ensureUnlocked(traderId) {
  const bal = await securityBalance(traderId);
  if (bal < 100) return { ok: false, message: "Deposit 100 USDT security money to unlock trader features" };
  return { ok: true, bal };
}

exports.profile = async (req, res) => {
  res.json({ success: true, trader: req.user });
};

exports.securityDeposit = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || Number(amount) < 100) return res.status(400).json({ message: "Invalid" });

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "SECURITY",
      amount: Number(amount),
      status: "PENDING",
      note: "Security deposit request",
    });

    res.json({ success: true, message: "Requested", tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.createAd = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const { title, description, minAmount, maxAmount, profitPercent } = req.body;

    const ad = await TraderAd.create({
      traderId: req.user._id,
      title: title || "Pro Trader Ad",
      description: description || "",
      minAmount: Number(minAmount || 50),
      maxAmount: Number(maxAmount || 5000),
      profitPercent: Number(profitPercent || 25),
      isActive: true,
    });

    res.json({ success: true, ad });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.myAds = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const ads = await TraderAd.find({ traderId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, ads });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.inventory = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const items = await HireTrade.find({ traderId: req.user._id })
      .populate("investorId", "name uid")
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectLoss = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const { hireId } = req.body;
    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire) return res.status(404).json({ message: "Invalid" });

    if (hire.status !== "HIRED") return res.status(400).json({ message: "Invalid" });

    hire.status = "LOSS_SELECTED";
    await hire.save();

    // refund investor
    await Transaction.create({
      userId: hire.investorId,
      type: "REFUND",
      amount: hire.amount,
      status: "SUCCESS",
      note: `Loss refund - HireId:${hire._id}`,
    });

    // make trader security = 0
    const secBal = await securityBalance(req.user._id);
    if (secBal > 0) {
      await Transaction.create({
        userId: req.user._id,
        type: "SECURITY",
        amount: -secBal,
        status: "SUCCESS",
        note: "Security forfeited due to loss",
      });
    }

    res.json({ success: true, message: "Loss selected & investor refunded. Security set to 0." });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.selectProfit = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const { hireId, profitPercent } = req.body;
    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire) return res.status(404).json({ message: "Invalid" });

    if (hire.status !== "HIRED") return res.status(400).json({ message: "Invalid" });

    const percent = Number(profitPercent || 25);
    const profitAmount = (hire.amount * percent) / 100;

    const traderEarning = profitAmount * 0.10;
    const investorCredit = hire.amount + (profitAmount - traderEarning);

    hire.status = "PROFIT_SELECTED";
    hire.profitPercent = percent;
    hire.profitAmount = profitAmount;
    hire.traderEarning = traderEarning;
    hire.investorCreditAmount = investorCredit;
    await hire.save();

    await Transaction.create({
      userId: hire.investorId,
      type: "PROFIT_CREDIT",
      amount: investorCredit,
      status: "SUCCESS",
      note: `Profit credited instantly. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Profit selected. Investor credited instantly." });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.uploadProof = async (req, res) => {
  try {
    const check = await ensureUnlocked(req.user._id);
    if (!check.ok) return res.status(403).json({ message: check.message });

    const { hireId, proofImage } = req.body;
    const hire = await HireTrade.findOne({ _id: hireId, traderId: req.user._id });
    if (!hire) return res.status(404).json({ message: "Invalid" });

    if (hire.status !== "PROFIT_SELECTED") return res.status(400).json({ message: "Invalid" });

    hire.proofImage = proofImage || "";
    hire.status = "PROOF_PENDING";
    await hire.save();

    res.json({ success: true, message: "Proof submitted. Pending approval." });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
