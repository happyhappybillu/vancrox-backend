const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    message: { type: String, required: true },
    image: { type: String, default: "" }, // admin photo optional
    forRole: { type: String, enum: ["investor", "trader", "all"], default: "all" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);