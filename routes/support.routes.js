const express = require("express");
const router = express.Router();

const SupportMessage = require("../models/SupportMessage");

// ✅ Visitor/Investor/Trader support message send
router.post("/send", async (req, res) => {
  try {
    const { name, email, userId, role, message } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: "Message is required" });
    }

    const newMsg = await SupportMessage.create({
      name: name || "Unknown",
      email: email || "",
      userId: userId || "",
      role: role || "visitor",
      message
    });

    res.json({ success: true, message: "Message sent", data: newMsg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Admin fetch all messages
router.get("/all", async (req, res) => {
  try {
    const all = await SupportMessage.find().sort({ createdAt: -1 });
    res.json({ success: true, data: all });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Admin reply
router.post("/reply/:id", async (req, res) => {
  try {
    const { reply } = req.body;

    const msg = await SupportMessage.findByIdAndUpdate(
      req.params.id,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    res.json({ success: true, message: "Replied", data: msg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
