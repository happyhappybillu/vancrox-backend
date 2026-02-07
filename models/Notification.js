const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // kis role ke liye notification hai
    // investor / trader / all
    targetRole: {
      type: String,
      enum: ["investor", "trader", "all"],
      required: true,
      index: true,
    },

    // specific user ke liye (optional)
    // agar blank ho → sabko dikhega (role ke hisaab se)
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // notification content
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

    // optional image (admin upload karega)
    image: {
      type: String, // base64 ya URL
      default: "",
    },

    // IMPORTANT RULE:
    // notification tab tak rahega jab tak admin delete/update na kare
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // admin ne update kiya ya nahi
    isUpdated: {
      type: Boolean,
      default: false,
    },

    // admin reference (name store nahi karna)
    createdByAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

module.exports = mongoose.model("Notification", notificationSchema);