const mongoose = require("mongoose");

/*
  USER ROLES:
  - investor → deposits & hires traders
  - trader   → security + ads + earnings
  - admin    → system/control panel
*/

const userSchema = new mongoose.Schema(
  {
    /* ================= BASIC ================= */

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

    profilePhoto: {
      type: String,
      default: "",
    },

    /* ================= SYSTEM IDS ================= */

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

    /* ================= INVESTOR ================= */

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ================= TRADER ================= */

    securityMoney: {
      type: Number,
      default: 0,
      min: 0,
    },

    traderLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    traderVerificationStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_SUBMITTED",
    },

    traderHistoryFile: {
      type: String,
      default: "",
    },

    traderTotalEarning: {
      type: Number,
      default: 0,
    },

    /* ================= CONTROL ================= */

    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    blockedReason: {
      type: String,
      default: "",
    },

    /* ================= META ================= */

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
userSchema.index({ role: 1, uid: 1 });
userSchema.index({ role: 1, tid: 1 });

module.exports = mongoose.model("User", userSchema);