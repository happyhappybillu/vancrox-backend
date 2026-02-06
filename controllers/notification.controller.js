const Notification = require("../models/Notification");

// admin creates notification
exports.createNotification = async (req, res) => {
  try {
    const { title, message, image, forRole } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title & message required" });
    }

    const n = await Notification.create({
      title,
      message,
      image: image || "",
      forRole: forRole || "all",
    });

    res.json({ success: true, notification: n });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// investor notifications
exports.getInvestorNotifications = async (req, res) => {
  try {
    const list = await Notification.find({
      $or: [{ forRole: "investor" }, { forRole: "all" }],
    }).sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};