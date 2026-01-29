const mongoose = require("mongoose");

const systemAddressSchema = new mongoose.Schema(
  {
    erc20: { type: String, default: "" },
    trc20: { type: String, default: "" },
    bep20: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SystemAddress", systemAddressSchema);
