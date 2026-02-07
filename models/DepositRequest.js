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
      min: 1,
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
      type: String, // base64 / image url
      required: true,
    },

    /* =========================
       STATUS FLOW (CRITICAL)
       =========================
       PENDING   → waiting system approval
       APPROVED  → balance credited
       REJECTED  → no balance credit
    ========================= */
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
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