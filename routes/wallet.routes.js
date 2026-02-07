const router = require("express").Router();
const wallet = require("../controllers/wallet.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ===========================
   COMMON
   =========================== */

// system deposit addresses (copy only)
router.get(
  "/system-address",
  protect,
  wallet.getSystemAddresses
);

/* ===========================
   INVESTOR
   =========================== */

router.post(
  "/deposit",
  protect,
  requireRole("investor"),
  wallet.deposit
);

router.post(
  "/withdraw",
  protect,
  requireRole("investor"),
  wallet.withdraw
);

/* ===========================
   TRADER
   =========================== */

router.post(
  "/security-deposit",
  protect,
  requireRole("trader"),
  wallet.traderSecurityDeposit
);

module.exports = router;