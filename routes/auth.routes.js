const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

/* REGISTER */
router.post("/register/investor", auth.registerInvestor);
router.post("/register/trader", auth.registerTrader);
/* LOGIN */
router.post("/login", auth.login);

/* AUTH USER */
router.get("/me", protect, auth.me);
router.post("/change-password", protect, auth.changePassword);

module.exports = router;