const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    image: {
      type: String, // optional (url / base64)
      default: "",
    },

    /* ✅ ROLE TARGETING (IMPORTANT) */
    forRole: {
      type: String,
      enum: ["investor"],
      default: "investor",
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true, // visible until admin deletes/deactivates
      index: true,
    },

    createdBy: {
      type: String,
      default: "SYSTEM", // admin name hidden
    },
  },
  { timestamps: true }
);

/* ✅ INDEX FOR PERFORMANCE */
notificationSchema.index({ forRole: 1, isActive: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);