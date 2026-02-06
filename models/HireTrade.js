const mongoose = require("mongoose");

const hireTradeSchema = new mongoose.Schema(
  {
    // kis investor ne hire kiya
    investorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // kis trader ko hire kiya
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // kaunsa trader ad hire hua
    traderAdId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TraderAd",
      required: true,
      index: true,
    },

    // 🔒 FIXED RULE
    // amount = traderAd.tradeAmount (investor cannot change)
    amount: {
      type: Number,
      required: true,
    },

    /* =========================
       STATUS FLOW (VERY IMPORTANT)
       =========================
       WAITING_TRADER_CONFIRMATION
         → trader CONFIRM / REJECT

       REJECTED_BY_TRADER
         → auto refund investor
         → trade closed

       ACTIVE
         → trader trading start

       LOSS_SELECTED
         → investor refund
         → trader security = 0

       PROFIT_SELECTED
         → investor credited instantly

       PROOF_PENDING
         → waiting for system approval

       PROOF_APPROVED
         → trader earning credited
         → trade completed
    ========================== */
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

    // trader confirmation flag
    traderConfirmation: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },

    // profit related data
    profitPercent: { type: Number, default: 0 },
    profitAmount: { type: Number, default: 0 },

    // investor ko kitna mila (instant credit on profit select)
    investorCreditAmount: { type: Number, default: 0 },

    // trader ka earning (10% of profit, after approval)
    traderEarning: { type: Number, default: 0 },

    // proof uploaded by trader
    proofImage: { type: String, default: "" },

    // timestamps for tracking
    traderConfirmedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("HireTrade", hireTradeSchema);