const mongoose = require("mongoose");

const systemAddressSchema = new mongoose.Schema(
  {
    /* =========================
       DEPOSIT / PAYOUT ADDRESSES
       (ADMIN / SYSTEM CONTROLLED)
    ========================= */

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

    /* =========================
       META
    ========================= */
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
  RULE:
  - System me sirf EK hi document hoga
  - Admin edit karega
  - Save ke turant baad:
      → Investor deposit page update
      → Trader profit payout page update
*/

module.exports = mongoose.model("SystemAddress", systemAddressSchema);