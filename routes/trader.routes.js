const router = require("express").Router();
const trader = require("../controllers/trader.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

router.get("/profile", protect, requireRole("trader"), trader.profile);

router.post("/security-deposit", protect, requireRole("trader"), trader.securityDeposit);

router.post("/ad", protect, requireRole("trader"), trader.createAd);
router.get("/my-ads", protect, requireRole("trader"), trader.myAds);

router.get("/inventory", protect, requireRole("trader"), trader.inventory);
router.post("/inventory/loss", protect, requireRole("trader"), trader.selectLoss);
router.post("/inventory/profit", protect, requireRole("trader"), trader.selectProfit);
router.post("/inventory/proof", protect, requireRole("trader"), trader.uploadProof);

module.exports = router;