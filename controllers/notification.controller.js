const Notification = require("../models/Notification");

/* ======================================================
   ADMIN → CREATE NOTIFICATION
   investor / trader / all
====================================================== */
exports.createNotification = async (req, res) => {
  try {
    const adminId = req.admin._id;

    const {
      targetRole,        // investor | trader | all
      targetUserId,      // optional
      title,
      message,
      image
    } = req.body;

    if (!targetRole || !title || !message) {
      return res.status(400).json({
        success: false,
        message: "Required fields missing",
      });
    }

    const notification = await Notification.create({
      targetRole,
      targetUserId: targetUserId || null,
      title,
      message,
      image: image || "",
      createdByAdmin: adminId,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      notification,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to create notification",
      error: err.message,
    });
  }
};

/* ======================================================
   INVESTOR / TRADER → GET NOTIFICATIONS
   (PERMANENT UNTIL ADMIN DELETE)
====================================================== */
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const role = req.user.role; // investor / trader

    const notifications = await Notification.find({
      isActive: true,
      $or: [
        { targetRole: "all" },
        { targetRole: role },
      ],
      $or: [
        { targetUserId: null },
        { targetUserId: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      notifications,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to load notifications",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN → GET ALL NOTIFICATIONS (DASHBOARD)
====================================================== */
exports.getAllNotifications = async (req, res) => {
  try {
    const list = await Notification.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      notifications: list,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch notifications",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN → UPDATE NOTIFICATION
   (TEXT / IMAGE CHANGE)
====================================================== */
exports.updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, image } = req.body;

    const updated = await Notification.findByIdAndUpdate(
      id,
      {
        title,
        message,
        image,
        isUpdated: true,
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification updated",
      notification: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to update notification",
      error: err.message,
    });
  }
};

/* ======================================================
   ADMIN → DELETE (DISABLE) NOTIFICATION
   (PERMANENTLY GONE FOR ALL USERS)
====================================================== */
exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const deleted = await Notification.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    res.json({
      success: true,
      message: "Notification removed successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to delete notification",
      error: err.message,
    });
  }
};