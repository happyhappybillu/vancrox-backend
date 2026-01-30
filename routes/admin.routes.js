const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

// ✅ Security deposit approve
router.post("/approve-security", protect, requireRole("admin"), admin.approveSecurity);

// ✅ Profit proof approve
router.post("/approve-proof", protect, requireRole("admin"), admin.approveProfitProof);

// ✅ Addresses
router.get("/addresses", protect, requireRole("admin"), admin.getAddresses);
router.post("/addresses", protect, requireRole("admin"), admin.updateAddresses);

module.exports = router;