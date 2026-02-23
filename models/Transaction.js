const mongoose = require("mongoose");

/*
 TRANSACTION = SINGLE SOURCE OF TRUTH
 ❌ Never change balance without transaction
*/

const transactionSchema = new mongoose.Schema(
  {
    /* ================= USER ================= */

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["investor", "trader"],
      required: true,
      index: true,
    },

    /* ================= TYPE ================= */

    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAW",
        "SECURITY",
        "SECURITY_REFUND",
        "TRADE_LOCK",
        "TRADE_RELEASE",
        "REFUND",
        "PROFIT_CREDIT",
        "TRADER_EARNING",
      ],
      required: true,
      index: true,
    },

    /* ================= AMOUNT ================= */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USDT",
    },

    /* ================= STATUS ================= */

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    /* ================= REFERENCES ================= */

    hireTradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HireTrade",
      default: null,
      index: true,
    },

    /* ================= PROOF / META ================= */

    proofImage: {
      type: String,
      default: "",
    },

    withdrawAddress: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    /* ================= ADMIN REVIEW ================= */

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */

transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);