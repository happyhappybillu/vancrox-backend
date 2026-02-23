const router = require("express").Router();
const notification = require("../controllers/notification.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ================= ADMIN ================= */
router.post(
  "/admin/create",
  protect,
  requireRole("admin"),
  notification.createNotification
);

router.put(
  "/admin/:id",
  protect,
  requireRole("admin"),
  notification.updateNotification
);

router.delete(
  "/admin/:id",
  protect,
  requireRole("admin"),
  notification.deleteNotification
);

/* ================= INVESTOR ================= */
router.get(
  "/investor",
  protect,
  requireRole("investor"),
  notification.getInvestorNotifications
);

module.exports = router;