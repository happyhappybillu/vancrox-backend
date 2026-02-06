const express = require("express");
const router = express.Router();

const {
  createNotification,
  getInvestorNotifications,
} = require("../controllers/notification.controller");

const { protect, adminOnly } = require("../middleware/auth.middleware");

// admin
router.post("/admin/notification", protect, adminOnly, createNotification);

// investor
router.get("/investor/notifications", protect, getInvestorNotifications);

module.exports = router;