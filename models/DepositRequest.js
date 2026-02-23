const mongoose = require("mongoose");

const depositRequestSchema = new mongoose.Schema(
  {
    /* =========================
       USER INFO
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
       DEPOSIT DETAILS
    ========================= */
    amount: {
      type: Number,
      required: true,
      min: 50, // ✅ Minimum deposit enforced
    },

    coin: {
      type: String,
      default: "USDT",
    },

    network: {
      type: String,
      enum: ["ERC20", "TRC20", "BEP20"],
      required: true,
    },

    /* =========================
       PROOF (MANDATORY)
    ========================= */
    proofImage: {
      type: String,
      required: true,
    },

    /* =========================
       STATUS FLOW
    ========================= */
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    /* =========================
       TRANSACTION LINK
    ========================= */
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },

    /* =========================
       SYSTEM ACTION LOG
    ========================= */
    systemNote: {
      type: String,
      default: "",
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("DepositRequest", depositRequestSchema);