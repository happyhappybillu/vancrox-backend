const mongoose = require("mongoose");

/*
  USER ROLES:
  - investor  → deposits & hires traders
  - trader    → security money + ads + earnings
  - admin     → system/control panel
*/

const userSchema = new mongoose.Schema(
  {
    /* =========================
       BASIC IDENTITY
    ========================= */

    role: {
      type: String,
      enum: ["investor", "trader", "admin"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      unique: true,
      sparse: true,
      default: null,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    /* =========================
       SYSTEM IDS
    ========================= */

    uid: {
      type: Number,
      default: null,
      index: true,
    },

    tid: {
      type: Number,
      default: null,
      index: true,
    },

    /* =========================
       PROFILE
    ========================= */

    profilePhoto: {
      type: String,
      default: "",
    },

    /* =========================
       INVESTOR RELATED
    ========================= */

    balance: {
      type: Number,
      default: function () {
        return this.role === "investor" ? 0 : undefined;
      },
      min: 0,
    },

    /* =========================
       TRADER RELATED (FIXED ✅)
       👉 Only exists for TRADER
    ========================= */

    securityMoney: {
      type: Number,
      default: function () {
        return this.role === "trader" ? 0 : undefined;
      },
      min: 0,
    },

    traderLevel: {
      type: Number,
      default: function () {
        return this.role === "trader" ? 1 : undefined;
      },
      min: 1,
      max: 10,
    },

    traderVerificationStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
      default: function () {
        return this.role === "trader"
          ? "NOT_SUBMITTED"
          : undefined;
      },
    },

    traderHistoryFile: {
      type: String,
      default: function () {
        return this.role === "trader" ? "" : undefined;
      },
    },

    traderTotalEarning: {
      type: Number,
      default: function () {
        return this.role === "trader" ? 0 : undefined;
      },
    },

    /* =========================
       ACCOUNT CONTROL
    ========================= */

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    blockedReason: {
      type: String,
      default: "",
    },

    /* =========================
       SECURITY / META
    ========================= */

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* =========================
   INDEXES
========================= */
userSchema.index({ role: 1, uid: 1 });
userSchema.index({ role: 1, tid: 1 });

module.exports = mongoose.model("User", userSchema);