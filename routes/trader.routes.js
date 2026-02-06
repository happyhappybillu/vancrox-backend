const router = require("express").Router();
const trader = require("../controllers/trader.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* =========================
   BASIC
========================= */
router.get(
  "/profile",
  protect,
  requireRole("trader"),
  trader.profile
);

/* =========================
   TRADING HISTORY (FIRST STEP)
========================= */
router.post(
  "/history/upload",
  protect,
  requireRole("trader"),
  trader.uploadTradingHistory
);

/* =========================
   SECURITY MONEY
========================= */
router.post(
  "/security-deposit",
  protect,
  requireRole("trader"),
  trader.securityDeposit
);

/* =========================
   ADS
========================= */
router.post(
  "/ad",
  protect,
  requireRole("trader"),
  trader.createAd
);

router.get(
  "/my-ads",
  protect,
  requireRole("trader"),
  trader.myAds
);

/* =========================
   INVENTORY
========================= */
router.get(
  "/inventory",
  protect,
  requireRole("trader"),
  trader.inventory
);

/* ➕ NEW: CONFIRM / REJECT INVESTOR */
router.post(
  "/inventory/confirm",
  protect,
  requireRole("trader"),
  trader.confirmHire
);

router.post(
  "/inventory/reject",
  protect,
  requireRole("trader"),
  trader.rejectHire
);

/* =========================
   PROFIT / LOSS
========================= */
router.post(
  "/inventory/loss",
  protect,
  requireRole("trader"),
  trader.selectLoss
);

router.post(
  "/inventory/profit",
  protect,
  requireRole("trader"),
  trader.selectProfit
);

router.post(
  "/inventory/proof",
  protect,
  requireRole("trader"),
  trader.uploadProof
);

module.exports = router;