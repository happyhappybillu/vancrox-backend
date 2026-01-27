const mongoose = require("mongoose");

const DepositRequestSchema = new mongoose.Schema(
  {
    investorId: { type: String, required: true, index: true },
    investorName: { type: String, required: true },

    amount: { type: Number, required: true, min: 1 },

    network: {
      type: String,
      enum: ["ERC20", "TRC20", "BEP20"],
      required: true,
    },

    proofImage: { type: String, default: "" },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepositRequest", DepositRequestSchema);
