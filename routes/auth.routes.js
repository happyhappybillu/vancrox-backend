const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

/* =====================
   AUTH ROUTES
===================== */

// investor register
router.post("/register/investor", authController.registerInvestor);

// trader register
router.post("/register/trader", authController.registerTrader);

// common login (investor / trader)
router.post("/login", authController.login);

// admin login (separate)
router.post("/admin/login", authController.adminLogin);

// get logged-in user profile
router.get("/me", protect, authController.me);

module.exports = router;