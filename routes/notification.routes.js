const express = require("express");
const router = express.Router();

const notificationController = require("../controllers/notification.controller");

// middlewares
const { protect } = require("../middleware/auth.middleware");
const { adminOnly } = require("../middleware/admin.middleware");

/* ======================================================
   ADMIN ROUTES
====================================================== */

// create notification (investor / trader / all)
router.post(
  "/admin/create",
  protect,
  adminOnly,
  notificationController.createNotification
);

// get all notifications (admin dashboard)
router.get(
  "/admin/all",
  protect,
  adminOnly,
  notificationController.getAllNotifications
);

// update notification
router.put(
  "/admin/update/:id",
  protect,
  adminOnly,
  notificationController.updateNotification
);

// delete (disable) notification
router.delete(
  "/admin/delete/:id",
  protect,
  adminOnly,
  notificationController.deleteNotification
);

/* ======================================================
   INVESTOR / TRADER ROUTES
====================================================== */

// get my notifications (permanent)
router.get(
  "/my",
  protect,
  notificationController.getMyNotifications
);

module.exports = router;