const mongoose = require("mongoose");

const SupportMessageSchema = new mongoose.Schema(
  {
    userUidTid: { type: String, required: true },
    role: { type: String, enum: ["investor", "trader"], required: true },

    message: { type: String, required: true },
    reply: { type: String, default: "" },

    status: { type: String, enum: ["open", "solved"], default: "open" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SupportMessage", SupportMessageSchema);
