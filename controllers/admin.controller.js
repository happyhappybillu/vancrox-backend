const User = require("../models/User");
const Transaction = require("../models/Transaction");
const HireTrade = require("../models/HireTrade");
const TraderAd = require("../models/TraderAd");
const SystemAddress = require("../models/SystemAddress");
const Notification = require("../models/Notification");
const SupportTicket = require("../models/SupportTicket");

/* =====================================================
   DASHBOARD OVERVIEW
===================================================== */
exports.dashboard = async (req, res) => {
  try {
    const totalInvestors = await User.countDocuments({ role: "investor" });
    const totalTraders = await User.countDocuments({ role: "trader" });

    const pendingTx = await Transaction.countDocuments({ status: "PENDING" });
    const pendingProofs = await HireTrade.countDocuments({ status: "PROOF_PENDING" });
    const openTickets = await SupportTicket.countDocuments({ status: "OPEN" });

    const deposits = await Transaction.aggregate([
      { $match: { type: "DEPOSIT", status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const withdraws = await Transaction.aggregate([
      { $match: { type: "WITHDRAW", status: "SUCCESS" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    res.json({
      success: true,
      totalInvestors,
      totalTraders,
      pendingRequests: pendingTx + pendingProofs,
      openTickets,
      totalDeposits: deposits[0]?.total || 0,
      totalWithdraws: withdraws[0]?.total || 0
    });
  } catch (e) {
    console.error("Admin dashboard error", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   USERS (INVESTOR / TRADER)
===================================================== */
exports.getUsers = async (req, res) => {
  try {
    const { role } = req.query;

    const filter = role
      ? { role }
      : { role: { $ne: "admin" } };

    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 });

    res.json({ success: true, users });
  } catch (e) {
    console.error("Get users error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { block } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { isBlocked: block },
      { new: true }
    );

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      success: true,
      message: block ? "User blocked" : "User unblocked",
      user,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   USER DETAILS (History View)
===================================================== */
exports.getUserDetails = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const history = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, user, history });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   TRADER HISTORY APPROVAL
===================================================== */
exports.approveTradingHistory = async (req, res) => {
  try {
    const { traderId } = req.body;

    const trader = await User.findOne({ _id: traderId, role: "trader" });
    if (!trader) return res.status(404).json({ message: "Trader not found" });

    trader.traderVerificationStatus = "APPROVED";
    await trader.save();

    res.json({ success: true, message: "Trading history approved" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectTradingHistory = async (req, res) => {
  try {
    const { traderId } = req.body;

    const trader = await User.findOne({ _id: traderId, role: "trader" });
    if (!trader) return res.status(404).json({ message: "Trader not found" });

    trader.traderVerificationStatus = "REJECTED";
    await trader.save();

    res.json({ success: true, message: "Trading history rejected" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   PENDING TRANSACTIONS
===================================================== */
exports.getPendingTransactions = async (req, res) => {
  try {
    const list = await Transaction.find({ status: "PENDING" })
      .populate("userId", "name role uid tid email balance")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveTransaction = async (req, res) => {
  try {
    const { txId } = req.body;

    const tx = await Transaction.findById(txId);
    if (!tx || tx.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid transaction" });
    }

    const user = await User.findById(tx.userId);

    if (tx.type === "DEPOSIT") {
      user.balance += tx.amount;
      await user.save();
    }

    if (tx.type === "SECURITY") {
      user.securityDeposit += tx.amount;
      await user.save();
    }

    tx.status = "SUCCESS";
    await tx.save();

    res.json({ success: true, message: "Transaction approved" });
  } catch (e) {
    console.error("Approve TX error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

exports.rejectTransaction = async (req, res) => {
  try {
    const { txId } = req.body;

    const tx = await Transaction.findById(txId);
    if (!tx || tx.status !== "PENDING") {
      return res.status(400).json({ message: "Invalid transaction" });
    }

    const user = await User.findById(tx.userId);

    if (tx.type === "WITHDRAW") {
      user.balance += tx.amount; // refund
      await user.save();

      await Transaction.create({
        userId: user._id,
        type: "REFUND",
        amount: tx.amount,
        status: "SUCCESS",
        note: "Withdraw rejected - refunded",
      });
    }

    tx.status = "REJECTED";
    await tx.save();

    res.json({ success: true, message: "Transaction rejected" });
  } catch (e) {
    console.error("Reject TX error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   PROFIT PROOF APPROVAL
===================================================== */
exports.getPendingProofs = async (req, res) => {
  try {
    const list = await HireTrade.find({ status: "PROOF_PENDING" })
      .populate("traderId", "name tid")
      .populate("investorId", "name uid")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.approveProfitProof = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findById(hireId);
    if (!hire || hire.status !== "PROOF_PENDING") {
      return res.status(400).json({ message: "Invalid trade" });
    }

    hire.status = "PROOF_APPROVED";
    hire.closedAt = new Date();
    await hire.save();

    await Transaction.create({
      userId: hire.traderId,
      type: "TRADER_EARNING",
      amount: hire.traderEarning,
      status: "SUCCESS",
      note: `Trader earning approved. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Profit proof approved" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   SYSTEM ADDRESSES
===================================================== */
exports.getAddresses = async (req, res) => {
  try {
    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({});
    res.json({ success: true, addresses: doc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateAddresses = async (req, res) => {
  try {
    const { erc20, trc20, bep20 } = req.body;

    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({});

    doc.erc20 = erc20;
    doc.trc20 = trc20;
    doc.bep20 = bep20;

    await doc.save();

    res.json({ success: true, message: "Addresses updated" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   NOTIFICATIONS (INVESTOR ONLY)
===================================================== */
exports.createNotification = async (req, res) => {
  try {
    const { title, message, image } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title & message required" });
    }

    const n = await Notification.create({
      title,
      message,
      image: image || "",
      forRole: "investor",
    });

    res.json({ success: true, notification: n });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =====================================================
   SUPPORT TICKETS
===================================================== */
exports.getSupportTickets = async (req, res) => {
  try {
    const list = await SupportTicket.find({ status: "OPEN" })
      .populate("userId", "name role uid tid")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.replySupport = async (req, res) => {
  try {
    const { ticketId, reply } = req.body;

    const t = await SupportTicket.findById(ticketId);
    if (!t) return res.status(404).json({ message: "Ticket not found" });

    t.replies.push({ message: reply, at: new Date() });
    await t.save();

    res.json({ success: true, message: "Reply sent" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.resolveSupport = async (req, res) => {
  try {
    const { ticketId } = req.body;

    const t = await SupportTicket.findById(ticketId);
    if (!t) return res.status(404).json({ message: "Ticket not found" });

    t.status = "RESOLVED";
    await t.save();

    res.json({ success: true, message: "Ticket resolved" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
/* =====================================================
   SINGLE USER TRANSACTION HISTORY
===================================================== */
exports.getUserTransactions = async (req, res) => {
  try {
    const { userId } = req.params;

    const tx = await Transaction.find({ userId })
      .sort({ createdAt: -1 });

    res.json({ success: true, tx });

  } catch (e) {
    console.error("User transaction fetch error", e);
    res.status(500).json({ message: "Server error" });
  }
};