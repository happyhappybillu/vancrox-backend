const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // role: investor / trader / system
    role: {
      type: String,
      enum: ["investor", "trader", "system"],
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      lowercase: true,
      trim: true,
    },

    mobile: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    // Investor ID
    uid: {
      type: Number,
      default: null,
      index: true,
    },

    // Trader ID
    tid: {
      type: Number,
      default: null,
      index: true,
    },

    profilePhoto: {
      type: String,
      default: "",
    },

    // 🔒 Block / Unblock (System panel control)
    isBlocked: {
      type: Boolean,
      default: false,
      index: true,
    },

    // 🛂 Trader verification status (VERY IMPORTANT)
    traderVerification: {
      type: String,
      enum: ["NOT_UPLOADED", "PENDING", "APPROVED", "REJECTED"],
      default: "NOT_UPLOADED",
      index: true,
    },

    // 📂 Trader 2-year history upload (images / pdf base64)
    tradingHistoryProof: {
      type: [String], // multiple images allowed
      default: [],
    },

    // 🔐 Account status (extra safety)
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);