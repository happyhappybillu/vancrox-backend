const Investor = require("../models/Investor");
const Transaction = require("../models/Transaction");
const SystemAddress = require("../models/SystemAddress");

// ✅ deposit address (only copy)
exports.getSystemAddress = async (req, res) => {
  try {
    let addr = await SystemAddress.findOne();
    if (!addr) {
      addr = await SystemAddress.create({ erc20: "", trc20: "", bep20: "" });
    }

    return res.json({
      success: true,
      addresses: {
        erc20: addr.erc20,
        trc20: addr.trc20,
        bep20: addr.bep20
      }
    });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Deposit request (pending)
exports.depositRequest = async (req, res) => {
  try {
    if (req.user.role !== "investor") return res.status(403).json({ message: "Access denied" });

    const { amount, proof } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (!proof) return res.status(400).json({ message: "Proof required" });

    const inv = await Investor.findById(req.user.id);
    if (!inv) return res.status(404).json({ message: "Investor not found" });

    const tx = await Transaction.create({
      userUidTid: inv.uid,
      role: "investor",
      type: "deposit",
      amount: Number(amount),
      status: "pending",
      proof
    });

    return res.status(201).json({ success: true, message: "Deposit pending ✅", tx });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};

// ✅ Withdraw request (pending + instant deduct)
exports.withdrawRequest = async (req, res) => {
  try {
    if (req.user.role !== "investor") return res.status(403).json({ message: "Access denied" });

    const { amount, withdrawTo } = req.body;
    const amt = Number(amount);

    if (!amt || amt <= 0) return res.status(400).json({ message: "Invalid amount" });
    if (amt < 100) return res.status(400).json({ message: "Minimum withdrawal is 100" });
    if (!withdrawTo) return res.status(400).json({ message: "Withdraw address required" });

    const inv = await Investor.findById(req.user.id);
    if (!inv) return res.status(404).json({ message: "Investor not found" });

    const available = (inv.balance || 0) - (inv.lockedBalance || 0);

    if (amt > available) return res.status(400).json({ message: "Insufficient balance" });

    // ✅ deduct instantly
    inv.balance = inv.balance - amt;
    await inv.save();

    const tx = await Transaction.create({
      userUidTid: inv.uid,
      role: "investor",
      type: "withdraw",
      amount: amt,
      status: "pending",
      withdrawTo
    });

    return res.status(201).json({ success: true, message: "Withdraw pending ✅", tx });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }
};
