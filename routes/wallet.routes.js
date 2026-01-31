const router = require("express").Router();
const walletController = require("../controllers/wallet.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/system-address", protect, walletController.getSystemAddress);

// Investor deposit/withdraw
router.post("/deposit", protect, walletController.depositRequest);
router.post("/withdraw", protect, walletController.withdrawRequest);

module.exports = router;