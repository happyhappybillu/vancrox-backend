const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    // kis user ka transaction hai (investor / trader)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // transaction type (STRICT CONTROL)
    type: {
      type: String,
      enum: [
        // investor
        "DEPOSIT",
        "WITHDRAW",
        "HIRE",
        "REFUND",
        "PROFIT_CREDIT",

        // trader
        "SECURITY",
        "TRADER_EARNING",
      ],
      required: true,
      index: true,
    },

    // amount (positive / negative both allowed internally)
    amount: {
      type: Number,
      required: true,
    },

    coin: {
      type: String,
      default: "USDT",
    },

    // status always controlled by system panel
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "REJECTED"],
      default: "PENDING",
      index: true,
    },

    // readable explanation
    note: {
      type: String,
      default: "",
    },

    // proof image (deposit / security / profit)
    proof: {
      type: String,
      default: "",
    },

    // withdraw / payout address
    withdrawTo: {
      type: String,
      default: "",
    },

    // who approved / rejected (system panel user)
    actionBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // action time (approve / reject)
    actionAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);