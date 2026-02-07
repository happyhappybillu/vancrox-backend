const express = require("express");
const router = express.Router();

const auth = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

/* ===========================
   REGISTER ROUTES
=========================== */

// Investor register
router.post("/register/investor", auth.registerInvestor);

// Trader register
router.post("/register/trader", auth.registerTrader);


/* ===========================
   LOGIN ROUTE
=========================== */

// Common login (investor / trader / admin)
router.post("/login", auth.login);


/* ===========================
   AUTHENTICATED ROUTES
=========================== */

// Get logged-in user profile
router.get("/me", protect, auth.me);

// Change password (investor / trader / admin)
router.post("/change-password", protect, auth.changePassword);

module.exports = router;