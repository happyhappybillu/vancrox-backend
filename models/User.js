const mongoose = require("mongoose");

/*
  USER ROLES:
  - investor  → normal user who deposits & hires traders
  - trader    → professional trader with security money & ads
  - admin     → system / control panel (never exposed publicly)
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
      sparse: true, // allow null
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
      select: false, // never expose
    },

    /* =========================
       SYSTEM IDS
    ========================= */

    // Investor ID → UID0001
    uid: {
      type: Number,
      default: null,
      index: true,
    },

    // Trader ID → TID0001
    tid: {
      type: Number,
      default: null,
      index: true,
    },

    /* =========================
       PROFILE
    ========================= */

    profilePhoto: {
      type: String, // base64 or CDN url
      default: "",
    },

    /* =========================
       INVESTOR RELATED
    ========================= */

    // Investor ka current usable balance
    // ❗ direct edit NOT allowed (only via transactions)
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =========================
       TRADER RELATED
    ========================= */

    // Security money deposited by trader
    securityMoney: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Trader level (1 → 10)
    // ⚠️ Only system/admin can change
    traderLevel: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    // Trader verification (2-year history approval)
    traderVerificationStatus: {
      type: String,
      enum: ["NOT_SUBMITTED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_SUBMITTED",
    },

    // Uploaded trading history file (image/pdf)
    traderHistoryFile: {
      type: String,
      default: "",
    },

    // Total earnings (read-only stats)
    traderTotalEarning: {
      type: Number,
      default: 0,
    },

    /* =========================
       ACCOUNT CONTROL
    ========================= */

    // Block / unblock user
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
    timestamps: true, // createdAt / updatedAt
  }
);

/* =========================
   INDEXES (PERFORMANCE)
========================= */
userSchema.index({ role: 1, uid: 1 });
userSchema.index({ role: 1, tid: 1 });

module.exports = mongoose.model("User", userSchema);