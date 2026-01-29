const mongoose = require("mongoose");

const WithdrawRequestSchema = new mongoose.Schema(
  {
    investorId: { type: String, required: true, index: true },
    investorName: { type: String, required: true },

    amount: { type: Number, required: true, min: 1 },

    toAddress: { type: String, required: true },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("WithdrawRequest", WithdrawRequestSchema);
