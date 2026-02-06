const router = require("express").Router();
const notification = require("../controllers/notification.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

// admin create notification
router.post(
  "/create",
  protect,
  requireRole("admin"),
  notification.createNotification
);

// investor notifications
router.get(
  "/investor",
  protect,
  requireRole("investor"),
  notification.getInvestorNotifications
);

module.exports = router;