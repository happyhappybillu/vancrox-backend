const User = require("../models/User");
const Transaction = require("../models/Transaction");
const HireTrade = require("../models/HireTrade");
const SystemAddress = require("../models/SystemAddress");

/* ===========================
   USER MANAGEMENT (New Features)
   =========================== */

// ✅ सभी यूज़र्स (Investors/Traders) की लिस्ट देखना
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query; // 'investor' या 'trader' फिल्टर के लिए
    const filter = role ? { role } : { role: { $ne: "admin" } };
    
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (e) {
    res.status(500).json({ success: false, message: "Error fetching users" });
  }
};

// ✅ यूजर को Block या Unblock करना
exports.toggleBlock = async (req, res) => {
  try {
    const { userId } = req.params;
    const { block } = req.body; // फ्रंटएंड से true या false आएगा

    const user = await User.findByIdAndUpdate(
      userId, 
      { isBlocked: block }, // आपके User.js मॉडल के हिसाब से
      { new: true }
    );
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    
    res.json({ success: true, message: block ? "Blocked ✅" : "Unblocked ✅", user });
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   TRANSACTIONS & TRADES (Your Logic)
   =========================== */

// ✅ डिपॉजिट (Security Money) अप्रूव करना
exports.approveSecurity = async (req, res) => {
  try {
    const { txId } = req.body;
    const tx = await Transaction.findById(txId);

    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    if (tx.type !== "SECURITY") return res.status(400).json({ message: "Invalid type" });

    tx.status = "SUCCESS";
    await tx.save();

    res.json({ success: true, message: "Security Approved ✅", tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ प्रॉफिट प्रूफ अप्रूव करना (ट्रेडर की कमाई क्रेडिट करना)
exports.approveProfitProof = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findById(hireId);
    if (!hire) return res.status(404).json({ message: "Trade not found" });

    if (hire.status !== "PROOF_PENDING") return res.status(400).json({ message: "Status not pending" });

    hire.status = "PROOF_APPROVED";
    await hire.save();

    // ट्रेडर के लिए नया ट्रांजेक्शन बनाना
    await Transaction.create({
      userId: hire.traderId,
      type: "TRADER_EARNING",
      amount: hire.traderEarning,
      status: "SUCCESS",
      note: `Trader earning credited. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Proof approved & Earning credited ✅" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   SYSTEM SETTINGS (Addresses)
   =========================== */

exports.updateAddresses = async (req, res) => {
  try {
    const { erc20, trc20, bep20 } = req.body;

    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({ erc20: "", trc20: "", bep20: "" });

    doc.erc20 = erc20 || doc.erc20;
    doc.trc20 = trc20 || doc.trc20;
    doc.bep20 = bep20 || doc.bep20;
    await doc.save();

    res.json({ success: true, message: "Addresses Saved ✅", doc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({ erc20: "Not Set", trc20: "Not Set", bep20: "Not Set" });

    res.json({ success: true, doc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
