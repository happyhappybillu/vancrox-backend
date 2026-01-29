const router = require("express").Router();
const investor = require("../controllers/investor.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

router.get("/profile", protect, requireRole("investor"), investor.profile);
router.get("/top-traders", protect, requireRole("investor"), investor.topTraders);

router.post("/hire", protect, requireRole("investor"), investor.hireTrader);
router.get("/my-traders", protect, requireRole("investor"), investor.myTraders);

router.get("/history", protect, requireRole("investor"), investor.history);

module.exports = router;
