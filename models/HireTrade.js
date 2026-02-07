const mongoose = require("mongoose");

/*
  HireTrade = COMPLETE TRADE LIFECYCLE
  ❌ No shortcut allowed
*/

const hireTradeSchema = new mongoose.Schema(
  {
    /* =========================
       CORE REFERENCES
    ========================= */

    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    traderAdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraderAd",
      required: true,
      index: true,
    },

    /* =========================
       TRADE AMOUNT (FIXED)
       = trader security money
    ========================= */

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    /* =========================
       STATUS ENGINE (LOCKED)
    ========================= */

    status: {
      type: String,
      enum: [
        "WAITING_TRADER_CONFIRMATION",
        "REJECTED_BY_TRADER",
        "ACTIVE",
        "LOSS_SELECTED",
        "PROFIT_SELECTED",
        "PROOF_PENDING",
        "PROOF_APPROVED",
      ],
      default: "WAITING_TRADER_CONFIRMATION",
      index: true,
    },

    /* =========================
       TRADER CONFIRMATION
    ========================= */

    traderConfirmation: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },

    traderConfirmedAt: {
      type: Date,
      default: null,
    },

    /* =========================
       PROFIT / LOSS DATA
    ========================= */

    profitPercent: {
      type: Number,
      default: 0,
      min: 0,
    },

    profitAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // investor gets this instantly on PROFIT_SELECTED
    investorCreditAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // trader gets this after admin approval
    traderEarning: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       PROOF & VERIFICATION
    ========================= */

    proofImage: {
      type: String,
      default: "",
    },

    proofUploadedAt: {
      type: Date,
      default: null,
    },

    /* =========================
       TRADE CLOSURE
    ========================= */

    closedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES (PERFORMANCE)
========================= */

hireTradeSchema.index({ investorId: 1, createdAt: -1 });
hireTradeSchema.index({ traderId: 1, status: 1 });
hireTradeSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("HireTrade", hireTradeSchema);