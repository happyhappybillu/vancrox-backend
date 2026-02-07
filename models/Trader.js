const mongoose = require("mongoose");

/*
  TraderAd = PUBLIC AD visible to investors
  Amount is FIXED = trader security money
*/

const traderAdSchema = new mongoose.Schema(
  {
    /* =========================
       OWNER
    ========================= */

    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       AD CONTENT
    ========================= */

    title: {
      type: String,
      default: "Professional Trader",
      trim: true,
      maxlength: 80,
    },

    description: {
      type: String,
      default: "",
      maxlength: 300,
    },

    /* =========================
       FINANCIAL RULES
    ========================= */

    // 🔒 FIXED: equals trader security money at time of ad creation
    tradeAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    // trader decides return %
    profitPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 300,
    },

    /* =========================
       VISIBILITY
    ========================= */

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    isLocked: {
      // locked when investor hires
      type: Boolean,
      default: false,
    },

    /* =========================
       SYSTEM META
    ========================= */

    createdFromLevel: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */

traderAdSchema.index({ isActive: 1, createdAt: -1 });
traderAdSchema.index({ traderId: 1, isActive: 1 });

module.exports = mongoose.model("TraderAd", traderAdSchema);