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
    },

    image: {
      type: String, // optional image (url / base64)
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true, // jab tak admin delete na kare
    },

    createdBy: {
      type: String,
      default: "SYSTEM", // admin name use nahi hoga
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);