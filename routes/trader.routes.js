const router = require("express").Router();
const trader = require("../controllers/trader.controller");

// ✅ correct import
const protect = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/auth.middleware");

// profile
router.get("/profile", protect, requireRole("trader"), trader.profile);

// security deposit request
router.post(
  "/security-deposit",
  protect,
  requireRole("trader"),
  trader.securityDeposit
);

// ads
router.post("/ad", protect, requireRole("trader"), trader.createAd);
router.get("/my-ads", protect, requireRole("trader"), trader.myAds);

// inventory
router.get("/inventory", protect, requireRole("trader"), trader.inventory);
router.post("/inventory/loss", protect, requireRole("trader"), trader.selectLoss);
router.post("/inventory/profit", protect, requireRole("trader"), trader.selectProfit);
router.post("/inventory/proof", protect, requireRole("trader"), trader.uploadProof);

module.exports = router;