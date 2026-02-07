const router = require("express").Router();
const investor = require("../controllers/investor.controller");
const notification = require("../controllers/notification.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ================= INVESTOR ================= */

// profile
router.get(
  "/profile",
  protect,
  requireRole("investor"),
  investor.profile
);

// top traders
router.get(
  "/top-traders",
  protect,
  requireRole("investor"),
  investor.topTraders
);

// hire trader
router.post(
  "/hire",
  protect,
  requireRole("investor"),
  investor.hireTrader
);

// my traders
router.get(
  "/my-traders",
  protect,
  requireRole("investor"),
  investor.myTraders
);

// history
router.get(
  "/history",
  protect,
  requireRole("investor"),
  investor.history
);

// withdraw
router.post(
  "/withdraw",
  protect,
  requireRole("investor"),
  investor.withdrawRequest
);

// notifications
router.get(
  "/notifications",
  protect,
  requireRole("investor"),
  notification.getInvestorNotifications
);

module.exports = router;