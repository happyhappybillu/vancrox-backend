const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC IDENTITY
    ========================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    uid: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },

    /* =========================
       ACCOUNT STATUS
    ========================= */
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* =========================
       BALANCE LOGIC
       (NO manual edit by admin)
    ========================= */
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    lockedBalance: {
      type: Number,
      default: 0,
      min: 0,
      // hire trader ke time yahan lock hota hai
    },

    /* =========================
       INVESTMENT STATS
    ========================= */
    totalDeposit: {
      type: Number,
      default: 0,
    },

    totalWithdraw: {
      type: Number,
      default: 0,
    },

    totalProfit: {
      type: Number,
      default: 0,
    },

    totalLoss: {
      type: Number,
      default: 0,
    },

    /* =========================
       SECURITY / META
    ========================= */
    lastActivityAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Investor", investorSchema);