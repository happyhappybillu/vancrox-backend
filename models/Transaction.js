const mongoose = require("mongoose");

/*
  TRANSACTION = SINGLE SOURCE OF TRUTH
  ❌ No balance edit without transaction
*/

const transactionSchema = new mongoose.Schema(
  {
    /* =========================
       USER REFERENCE
    ========================= */

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

    /* =========================
       TRANSACTION TYPE
    ========================= */

    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "WITHDRAW",
        "SECURITY",
        "SECURITY_REFUND",
        "TRADE_LOCK",
        "REFUND",
        "PROFIT_CREDIT",
        "TRADER_EARNING",
      ],
      required: true,
      index: true,
    },

    /* =========================
       AMOUNT DETAILS
    ========================= */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "USDT",
    },

    /* =========================
       STATUS FLOW
    =========================
       PENDING  → admin action needed
       SUCCESS  → money finalized
       REJECTED → auto rollback
    ========================= */

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    /* =========================
       OPTIONAL REFERENCES
    ========================= */

    // hireTrade reference (trade related tx)
    hireTradeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HireTrade",
      default: null,
      index: true,
    },

    /* =========================
       PROOF / META
    ========================= */

    // deposit / security proof image (base64 or url)
    proofImage: {
      type: String,
      default: "",
    },

    // withdraw address
    withdrawAddress: {
      type: String,
      default: "",
    },

    note: {
      type: String,
      default: "",
    },

    /* =========================
       ADMIN ACTION META
    ========================= */

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
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

/* =========================
   INDEXES
========================= */
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);