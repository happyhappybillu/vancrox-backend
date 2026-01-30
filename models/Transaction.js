const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAW",
        "SECURITY",
        "HIRE",
        "REFUND",
        "PROFIT_CREDIT",
        "TRADER_EARNING",
      ],
      required: true,
    },

    amount: { type: Number, required: true },
    coin: { type: String, default: "USDT" },

    // ✅ FIX: Default should be PENDING (NOT SUCCESS)
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "PENDING",
    },

    note: { type: String, default: "" },

    // ✅ OPTIONAL: proof image for deposit/security etc.
    proof: { type: String, default: "" },

    // ✅ OPTIONAL: withdraw address
    withdrawTo: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);