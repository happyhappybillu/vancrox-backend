const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    type: {
      type: String,
      enum: ["DEPOSIT", "WITHDRAW", "SECURITY", "HIRE", "REFUND", "PROFIT_CREDIT", "TRADER_EARNING"],
      required: true,
    },

    amount: { type: Number, required: true },
    coin: { type: String, default: "USDT" },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "SUCCESS",
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
