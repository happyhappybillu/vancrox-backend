const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const walletController = require("../controllers/wallet.controller");

router.get("/system-address", auth, walletController.getSystemAddress);

// Investor deposit/withdraw
router.post("/deposit", auth, walletController.depositRequest);
router.post("/withdraw", auth, walletController.withdrawRequest);

module.exports = router;
