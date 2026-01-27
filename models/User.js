const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["investor", "trader", "admin"], required: true },

    name: { type: String, required: true },
    email: { type: String, default: "" },
    mobile: { type: String, default: "" },

    password: { type: String, required: true },

    uid: { type: Number, default: 0 }, // Investor UID starts 5000
    tid: { type: Number, default: 0 }, // Trader TID starts 5000

    profilePhoto: { type: String, default: "" },

    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
