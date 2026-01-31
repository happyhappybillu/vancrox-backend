const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

const protect = require("../middleware/auth.middleware"); // ✅ default export

// register
router.post("/register/investor", authController.registerInvestor);
router.post("/register/trader", authController.registerTrader);

// login
router.post("/login", authController.login);

// admin login
router.post("/admin/login", authController.adminLogin);

// ✅ me
router.get("/me", protect, authController.me);

module.exports = router;