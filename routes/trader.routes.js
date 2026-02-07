const router = require("express").Router();
const trader = require("../controllers/trader.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   TRADER CORE
====================================================== */
router.get("/profile", protect, requireRole("trader"), trader.profile);

// security
router.post("/security-deposit", protect, requireRole("trader"), trader.securityDeposit);

// ads
router.post("/ad", protect, requireRole("trader"), trader.createAd);
router.get("/my-ads", protect, requireRole("trader"), trader.myAds);

// inventory
router.get("/inventory", protect, requireRole("trader"), trader.inventory);

// confirm / reject hire
router.post("/inventory/confirm", protect, requireRole("trader"), trader.confirmHire);
router.post("/inventory/reject", protect, requireRole("trader"), trader.rejectHire);

// trade result
router.post("/inventory/loss", protect, requireRole("trader"), trader.selectLoss);
router.post("/inventory/profit", protect, requireRole("trader"), trader.selectProfit);
router.post("/inventory/proof", protect, requireRole("trader"), trader.uploadProof);

module.exports = router;