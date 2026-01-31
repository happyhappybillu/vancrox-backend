const router = require("express").Router();
const admin = require("../controllers/admin.controller");

const protect = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/auth.middleware");

router.post("/approve-security", protect, requireRole("admin"), admin.approveSecurity);
router.post("/approve-proof", protect, requireRole("admin"), admin.approveProfitProof);

router.get("/addresses", protect, requireRole("admin"), admin.getAddresses);
router.post("/addresses", protect, requireRole("admin"), admin.updateAddresses);

module.exports = router;