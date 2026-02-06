const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   SYSTEM PANEL – ADMIN ROUTES (FINAL)
   ====================================================== */

/* =========================
   DASHBOARD OVERVIEW
   ========================= */
router.get(
  "/dashboard",
  protect,
  requireRole("admin"),
  admin.dashboardStats
);

/* =========================
   USER MANAGEMENT
   ========================= */

// all investors / traders
router.get(
  "/users",
  protect,
  requireRole("admin"),
  admin.getUsers
);

// single user details (click UID / TID)
router.get(
  "/users/:userId",
  protect,
  requireRole("admin"),
  admin.getUserDetails
);

// block / unblock user
router.post(
  "/users/:userId/block",
  protect,
  requireRole("admin"),
  admin.toggleBlockUser
);

/* =========================
   TRADER VERIFICATION
   ========================= */

// approve trader (2 year history)
router.post(
  "/trader/approve",
  protect,
  requireRole("admin"),
  admin.approveTrader
);

// reject trader
router.post(
  "/trader/reject",
  protect,
  requireRole("admin"),
  admin.rejectTrader
);

/* =========================
   PENDING TRANSACTIONS
   ========================= */

// approve deposit / withdraw / security
router.post(
  "/transaction/approve",
  protect,
  requireRole("admin"),
  admin.approveTransaction
);

// reject deposit / withdraw
router.post(
  "/transaction/reject",
  protect,
  requireRole("admin"),
  admin.rejectTransaction
);

/* =========================
   PROFIT PROOF APPROVAL
   ========================= */

router.post(
  "/profit/approve",
  protect,
  requireRole("admin"),
  admin.approveProfitProof
);

/* =========================
   SYSTEM ADDRESSES (CRITICAL)
   ========================= */

router.get(
  "/addresses",
  protect,
  requireRole("admin"),
  admin.getSystemAddress
);

router.post(
  "/addresses",
  protect,
  requireRole("admin"),
  admin.updateSystemAddress
);

module.exports = router;