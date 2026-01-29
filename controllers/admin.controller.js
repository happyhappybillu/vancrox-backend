const Transaction = require("../models/Transaction");
const HireTrade = require("../models/HireTrade");
const SystemAddress = require("../models/SystemAddress");

// ✅ approve security deposit tx
exports.approveSecurity = async (req, res) => {
  try {
    const { txId } = req.body;
    const tx = await Transaction.findById(txId);

    if (!tx) return res.status(404).json({ message: "Invalid" });
    if (tx.type !== "SECURITY") return res.status(400).json({ message: "Invalid" });

    tx.status = "SUCCESS";
    await tx.save();

    res.json({ success: true, message: "Approved", tx });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ approve profit proof (gives trader earning)
exports.approveProfitProof = async (req, res) => {
  try {
    const { hireId } = req.body;

    const hire = await HireTrade.findById(hireId);
    if (!hire) return res.status(404).json({ message: "Invalid" });

    if (hire.status !== "PROOF_PENDING") return res.status(400).json({ message: "Invalid" });

    hire.status = "PROOF_APPROVED";
    await hire.save();

    await Transaction.create({
      userId: hire.traderId,
      type: "TRADER_EARNING",
      amount: hire.traderEarning,
      status: "SUCCESS",
      note: `Trader earning credited. HireId:${hire._id}`,
    });

    res.json({ success: true, message: "Proof approved & trader earning credited." });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Address change feature (ERC/TRC/BEP)
exports.updateAddresses = async (req, res) => {
  try {
    const { erc20, trc20, bep20 } = req.body;

    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({ erc20: "", trc20: "", bep20: "" });

    doc.erc20 = erc20 || doc.erc20;
    doc.trc20 = trc20 || doc.trc20;
    doc.bep20 = bep20 || doc.bep20;
    await doc.save();

    res.json({ success: true, message: "Saved", doc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAddresses = async (req, res) => {
  try {
    let doc = await SystemAddress.findOne();
    if (!doc) doc = await SystemAddress.create({ erc20: "", trc20: "", bep20: "" });

    res.json({ success: true, doc });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};
