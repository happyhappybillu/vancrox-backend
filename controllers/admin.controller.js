const User = require("../models/User");
const Transaction = require("../models/Transaction");
const HireTrade = require("../models/HireTrade");
const TraderAd = require("../models/TraderAd");
const SystemAddress = require("../models/SystemAddress");

/* ======================================================
   SYSTEM PANEL – ADMIN CONTROLLER (FINAL)
   ====================================================== */

/* ======================================================
   1️⃣ DASHBOARD OVERVIEW
   ====================================================== */
exports.dashboardStats = async (req, res) => {
  try {
    const totalInvestors = await User.countDocuments({ role: "investor" });
    const totalTraders = await User.countDocuments({ role: "trader" });

    const pendingDeposits = await Transaction.countDocuments({
      type: "DEPOSIT",
      status: "PENDING",
    });

    const pendingWithdraws = await Transaction.countDocuments({
      type: "WITHDRAW",
      status: "PENDING",
    });

    const pendingProfitProofs = await HireTrade.countDocuments({
      status: "PROOF_PENDING",
    });

    res.json({
      success: true,
      stats: {
        totalInvestors,
        totalTraders,
        pendingDeposits,
        pendingWithdraws,
        pendingProfitProofs,
      },
    });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ======================================================
   2️⃣ USER MANAGEMENT (INVESTOR / TRADER)
   ====================================================== */

// 🔍 list users
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query; // investor | trader
    const filter = role ? { role } : { role: { $ne: "admin" } };

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// 🔍 single user details (click on UID / TID)
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const deposits = await Transaction.find({
      userId,
      type: "DEPOSIT",
      status: "SUCCESS",
    });

    const withdraws = await Transaction.find({
      userId,
      type: "WITHDRAW",
      status: "SUCCESS",
    });

    const balance = deposits.reduce((s, d) => s + d.amount, 0) -
                    withdraws.reduce((s, w) => s + w.amount, 0);

    res.json({
      success: true,
      user,
      summary: {
        totalDeposit: deposits.reduce((s, d) => s + d.amount, 0),
        totalWithdraw: withdraws.reduce((s, w) => s + w.amount, 0),
        balance,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// 🔒 block / unblock
exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: !!block },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      message: block ? "User blocked ✅" : "User unblocked ✅",
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   3️⃣ TRADER VERIFICATION (2 YEARS HISTORY)
   ====================================================== */
exports.approveTrader = async (req, res) => {
  try {
    const { traderId } = req.body;

    const trader = await User.findById(traderId);
    if (!trader || trader.role !== "trader")
      return res.status(404).json({ message: "Trader not found" });

    trader.isVerified = true;
    await trader.save();

    res.json({ success: true, message: "Trader approved ✅" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectTrader = async (req, res) => {
  try {
    const { traderId } = req.body;

    const trader = await User.findById(traderId);
    if (!trader || trader.role !== "trader")
      return res.status(404).json({ message: "Trader not found" });

    trader.isVerified = false;
    await trader.save();

    res.json({ success: true, message: "Trader rejected ❌" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   4️⃣ PENDING APPROVAL CENTER
   ====================================================== */

// 🔄 approve deposit / withdraw / security
exports.approveTransaction = async (req, res) => {
  try {
    const { txId } = req.body;

    const tx = await Transaction.findById(txId);
    if (!tx || tx.status !== "PENDING")
      return res.status(404).json({ message: "Invalid transaction" });

    tx.status = "SUCCESS";
    await tx.save();

    res.json({ success: true, message: "Transaction approved ✅" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ❌ reject transaction
exports.rejectTransaction = async (req, res) => {
  try {
    const { txId } = req.body;

    const tx = await Transaction.findById(txId);
    if (!tx || tx.status !== "PENDING")
      return res.status(404).json({ message: "Invalid transaction" });

    tx.status = "REJECTED";
    await tx.save();

    // auto-refund if withdraw rejected
    if (tx.type === "WITHDRAW") {
      await Transaction.create({
        userId: tx.userId,
        type: "REFUND",
        amount: tx.amount,
        status: "SUCCESS",
        note: "Withdraw rejected – refunded",
      });
    }

    res.json({ success: true, message: "Transaction rejected ❌" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   5️⃣ PROFIT PROOF APPROVAL
   ====================================================== */
exports.approveProfitProof = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findById(hireId);
    if (!hire || hire.status !== "PROOF_PENDING")
      return res.status(400).json({ message: "Invalid hire trade" });

    hire.status = "PROOF_APPROVED";
    await hire.save();

    await Transaction.create({
      userId: hire.traderId,
      type: "TRADER_EARNING",
      amount: hire.traderEarning,
      status: "SUCCESS",
      note: `Profit approved | HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Profit approved & credited ✅" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   6️⃣ SYSTEM ADDRESS (CRITICAL)
   ====================================================== */
exports.updateSystemAddress = async (req, res) => {
  try {
    const { erc20, trc20, bep20 } = req.body;

    let addr = await SystemAddress.findOne();
    if (!addr) addr = await SystemAddress.create({});

    if (erc20 !== undefined) addr.erc20 = erc20;
    if (trc20 !== undefined) addr.trc20 = trc20;
    if (bep20 !== undefined) addr.bep20 = bep20;

    await addr.save();

    res.json({ success: true, message: "System addresses updated ✅" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSystemAddress = async (req, res) => {
  try {
    let addr = await SystemAddress.findOne();
    if (!addr) addr = await SystemAddress.create({});

    res.json({ success: true, addresses: addr });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};