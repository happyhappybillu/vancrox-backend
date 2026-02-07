const Transaction = require("../models/Transaction");
const SystemAddress = require("../models/SystemAddress");
const User = require("../models/User");

/* ===========================
   GET SYSTEM ADDRESSES
   =========================== */
// investor / trader (copy only)
exports.getSystemAddresses = async (req, res) => {
  try {
    let addr = await SystemAddress.findOne();
    if (!addr) {
      addr = await SystemAddress.create({
        erc20: "",
        trc20: "",
        bep20: "",
      });
    }

    res.json({
      success: true,
      addresses: {
        erc20: addr.erc20,
        trc20: addr.trc20,
        bep20: addr.bep20,
      },
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   INVESTOR DEPOSIT
   =========================== */
exports.deposit = async (req, res) => {
  try {
    const { amount, proof } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    if (!proof) {
      return res.status(400).json({ message: "Proof image required" });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "DEPOSIT",
      amount: Number(amount),
      proof,
      status: "PENDING",
      note: "Deposit request",
    });

    res.json({
      success: true,
      message: "Deposit submitted, pending system approval",
      tx,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   INVESTOR WITHDRAW
   =========================== */
exports.withdraw = async (req, res) => {
  try {
    const { amount, withdrawTo } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Minimum withdraw is 100" });
    }
    if (!withdrawTo) {
      return res.status(400).json({ message: "Withdraw address required" });
    }

    // 🔒 balance calculation (SUCCESS only)
    const txs = await Transaction.find({
      userId: req.user._id,
      status: "SUCCESS",
    });

    let balance = 0;
    txs.forEach((t) => {
      if (t.type === "DEPOSIT") balance += t.amount;
      if (t.type === "WITHDRAW") balance -= t.amount;
      if (t.type === "PROFIT_CREDIT") balance += t.amount;
    });

    if (balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "WITHDRAW",
      amount: Number(amount),
      withdrawTo,
      status: "PENDING",
      note: "Withdraw request",
    });

    res.json({
      success: true,
      message: "Withdraw request submitted, pending approval",
      tx,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   TRADER SECURITY DEPOSIT
   =========================== */
exports.traderSecurityDeposit = async (req, res) => {
  try {
    const { amount, proof } = req.body;

    if (!amount || amount < 100) {
      return res.status(400).json({ message: "Minimum security deposit is 100" });
    }
    if (!proof) {
      return res.status(400).json({ message: "Proof image required" });
    }

    const tx = await Transaction.create({
      userId: req.user._id,
      type: "SECURITY",
      amount: Number(amount),
      proof,
      status: "PENDING",
      note: "Trader security deposit",
    });

    res.json({
      success: true,
      message: "Security deposit submitted, pending approval",
      tx,
    });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};