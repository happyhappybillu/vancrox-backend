const express = require("express");
const router = express.Router();

const investorController = require("../controllers/investor.controller");
const notificationController = require("../controllers/notification.controller");

const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   INVESTOR CORE
====================================================== */

// profile
router.get(
  "/profile",
  protect,
  requireRole("investor"),
  investorController.profile
);

// top traders (live ads)
router.get(
  "/top-traders",
  protect,
  requireRole("investor"),
  investorController.topTraders
);

// hire trader (ONLY confirm flow)
router.post(
  "/hire",
  protect,
  requireRole("investor"),
  investorController.hireTrader
);

// my traders (waiting / active / profit / loss / rejected)
router.get(
  "/my-traders",
  protect,
  requireRole("investor"),
  investorController.myTraders
);

// transaction history
router.get(
  "/history",
  protect,
  requireRole("investor"),
  investorController.history
);

// withdraw request
router.post(
  "/withdraw",
  protect,
  requireRole("investor"),
  investorController.withdrawRequest
);

/* ======================================================
   INVESTOR NOTIFICATIONS
   (admin/system creates → investor reads)
====================================================== */
router.get(
  "/notifications",
  protect,
  requireRole("investor"),
  notificationController.getInvestorNotifications
);

module.exports = router;