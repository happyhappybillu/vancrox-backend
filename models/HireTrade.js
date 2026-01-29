const mongoose = require("mongoose");

const hireTradeSchema = new mongoose.Schema(
  {
    investorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    traderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    traderAdId: { type: mongoose.Schema.Types.ObjectId, ref: "TraderAd", required: true },

    amount: { type: Number, required: true },

    status: {
      type: String,
      enum: ["HIRED", "PROFIT_SELECTED", "LOSS_SELECTED", "PROOF_PENDING", "PROOF_APPROVED"],
      default: "HIRED",
    },

    profitPercent: { type: Number, default: 0 },
    profitAmount: { type: Number, default: 0 },

    investorCreditAmount: { type: Number, default: 0 },
    traderEarning: { type: Number, default: 0 },

    proofImage: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HireTrade", hireTradeSchema);
