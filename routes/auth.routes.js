const router = require("express").Router();
const auth = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/register/investor", auth.registerInvestor);
router.post("/register/trader", auth.registerTrader);
router.post("/login", auth.login);
router.get("/me", protect, auth.me);

module.exports = router;
