const mongoose = require("mongoose");

const traderAdSchema = new mongoose.Schema(
  {
    // kis trader ka ad hai
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // ad basic info
    title: {
      type: String,
      default: "Pro Trader Ad",
    },

    description: {
      type: String,
      default: "",
    },

    // ⚠️ IMPORTANT RULE (as you said)
    // Investor amount adjust nahi karega
    // Ad amount = trader security money
    tradeAmount: {
      type: Number,
      required: true,
    },

    // profit percentage shown to investor
    profitPercent: {
      type: Number,
      default: 25,
    },

    // ad status lifecycle
    status: {
      type: String,
      enum: [
        "LIVE",        // visible to investors
        "LOCKED",      // hired by investor
        "COMPLETED",   // profit/loss done
        "STOPPED",     // trader security 0 / account issue
      ],
      default: "LIVE",
      index: true,
    },

    // investor ne hire kiya to ye fill hoga
    hiredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // hire ke baad lock time
    hiredAt: {
      type: Date,
      default: null,
    },

    // trader confirmation flow
    traderConfirmation: {
      type: String,
      enum: ["PENDING", "CONFIRMED", "REJECTED"],
      default: "PENDING",
    },

    // admin/system control
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TraderAd", traderAdSchema);