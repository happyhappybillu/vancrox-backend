const router = require("express").Router();
const investor = require("../controllers/investor.controller");
const notification = require("../controllers/notification.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   INVESTOR CORE
====================================================== */

// profile
router.get("/profile", protect, requireRole("investor"), investor.profile);

// top traders (live ads)
router.get("/top-traders", protect, requireRole("investor"), investor.topTraders);

// hire trader (ONLY confirm flow)
router.post("/hire", protect, requireRole("investor"), investor.hireTrader);

// my traders (waiting / active / profit / loss / rejected)
router.get("/my-traders", protect, requireRole("investor"), investor.myTraders);

// transaction history
router.get("/history", protect, requireRole("investor"), investor.history);

// withdraw request
router.post("/withdraw", protect, requireRole("investor"), investor.withdrawRequest);

/* ======================================================
   INVESTOR NOTIFICATIONS
   (admin/system creates → investor reads)
====================================================== */
router.get(
  "/notifications",
  protect,
  requireRole("investor"),
  notification.getInvestorNotifications
);

module.exports = router;