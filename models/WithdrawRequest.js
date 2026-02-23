const mongoose = require("mongoose");

const withdrawRequestSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["investor", "trader"],
      required: true,
      index: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    coin: {
      type: String,
      default: "USDT",
    },

    network: {
      type: String,
      enum: ["ERC20", "TRC20", "BEP20"],
      required: true,
    },

    withdrawAddress: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    systemNote: {
      type: String,
      default: "",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", withdrawRequestSchema);