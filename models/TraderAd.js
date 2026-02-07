const mongoose = require("mongoose");

const traderAdSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC RELATION
    ========================= */
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /* =========================
       AD DETAILS
    ========================= */
    title: {
      type: String,
      default: "Professional Trading Ad",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /* =========================
       FIXED RULES (VERY IMPORTANT)
    ========================= */

    // 🔒 Trading amount = trader security money
    tradeAmount: {
      type: Number,
      required: true,
      min: 1,
    },

    // 📈 Trader can set return %
    returnPercent: {
      type: Number,
      required: true,
      min: 1,
      max: 500,
    },

    /* =========================
       STATUS & VISIBILITY
    ========================= */

    // ad live ya nahi
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // ek ad ek time pe
    isLocked: {
      type: Boolean,
      default: false,
    },

    /* =========================
       CONTROL META
    ========================= */

    // kis level pe ad banaya
    traderLevel: {
      type: Number,
      default: 1,
    },

    // kitne profitable trades ke baad ad unlock hua
    createdAfterTrades: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   IMPORTANT NOTES (RULES)
=========================

1️⃣ Trader:
   - Ek time pe sirf allowed ads:
       level 1–2 → 1 ad
       level 3–4 → 2 ads
       level 5–6 → 3 ads
       level 7–8 → 4 ads
       level 9–10 → 5 ads

2️⃣ tradeAmount:
   - Automatically = trader security money
   - Trader manually change nahi kar sakta

3️⃣ Investor:
   - Top Traders list yahin se aayegi
   - Scrollable list (no limit)

4️⃣ Hire ke baad:
   - ad isLocked = true
   - ad isActive = false
   - trade complete/reject hone par:
       → admin ya system unlock karega

5️⃣ Admin:
   - Force disable / enable ad
   - Change level (indirectly affects ad limits)

*/

module.exports = mongoose.model("TraderAd", traderAdSchema);