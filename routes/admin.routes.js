const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { requireRole } = require("../middleware/auth.middleware");

router.post("/approve-security", authMiddleware, requireRole("admin"), admin.approveSecurity);
router.post("/reject-security", authMiddleware, requireRole("admin"), admin.rejectSecurity);

router.post("/approve-proof", authMiddleware, requireRole("admin"), admin.approveProfitProof);

// ✅ deposit approval
router.post("/approve-deposit", authMiddleware, requireRole("admin"), admin.approveDeposit);
router.post("/reject-deposit", authMiddleware, requireRole("admin"), admin.rejectDeposit);

// ✅ withdraw approval
router.post("/approve-withdraw", authMiddleware, requireRole("admin"), admin.approveWithdraw);
router.post("/reject-withdraw", authMiddleware, requireRole("admin"), admin.rejectWithdraw);

router.get("/addresses", authMiddleware, requireRole("admin"), admin.getAddresses);
router.post("/addresses", authMiddleware, requireRole("admin"), admin.updateAddresses);

module.exports = router;