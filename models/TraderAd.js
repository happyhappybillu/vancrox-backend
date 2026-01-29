const mongoose = require("mongoose");

const traderAdSchema = new mongoose.Schema(
  {
    traderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    title: { type: String, default: "Pro Trader Ad" },
    description: { type: String, default: "" },

    minAmount: { type: Number, default: 50 },
    maxAmount: { type: Number, default: 5000 },

    profitPercent: { type: Number, default: 25 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TraderAd", traderAdSchema);
