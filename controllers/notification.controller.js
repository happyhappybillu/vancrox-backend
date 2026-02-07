const Notification = require("../models/Notification");

/* ======================================================
   ADMIN: CREATE NOTIFICATION (INVESTOR ONLY)
====================================================== */
exports.createNotification = async (req, res) => {
  try {
    const { title, message, image } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: "Title & message required" });
    }

    const notification = await Notification.create({
      title,
      message,
      image: image || "",
    });

    res.json({
      success: true,
      message: "Notification sent to investors",
      notification,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: UPDATE NOTIFICATION
====================================================== */
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await Notification.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, updated });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: DELETE NOTIFICATION
====================================================== */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ message: "Notification not found" });
    }

    res.json({ success: true, message: "Notification removed" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   INVESTOR: GET ALL NOTIFICATIONS (PERMANENT)
====================================================== */
exports.getInvestorNotifications = async (req, res) => {
  try {
    const list = await Notification.find({ isActive: true })
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};