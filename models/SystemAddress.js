const mongoose = require("mongoose");

/**
 * =========================
 * SYSTEM WALLET ADDRESSES
 * =========================
 * ⚠️ Single document only
 * Used by:
 * - Investor Deposit Page
 * - Trader Profit Payout Page
 * Editable ONLY from System Panel
 */
const systemAddressSchema = new mongoose.Schema(
  {
    erc20: {
      type: String,
      default: "",
      trim: true,
    },

    trc20: {
      type: String,
      default: "",
      trim: true,
    },

    bep20: {
      type: String,
      default: "",
      trim: true,
    },

    // 🔒 safety flag (future-proof)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * ⚠️ RULE:
 * Database me hamesha sirf 1 document hona chahiye
 * Admin panel usi ko update karega
 */
module.exports = mongoose.model("SystemAddress", systemAddressSchema);