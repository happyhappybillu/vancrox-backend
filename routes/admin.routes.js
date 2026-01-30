const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

// ✅ pending list
router.get("/tx/pending", protect, requireRole("admin"), admin.pendingTransactions);

// ✅ deposit approvals
router.post("/approve-deposit", protect, requireRole("admin"), admin.approveDeposit);
router.post("/reject-deposit", protect, requireRole("admin"), admin.rejectDeposit);

// ✅ withdraw approvals
router.post("/approve-withdraw", protect, requireRole("admin"), admin.approveWithdraw);
router.post("/reject-withdraw", protect, requireRole("admin"), admin.rejectWithdraw);

// ✅ trader security & proof
router.post("/approve-security", protect, requireRole("admin"), admin.approveSecurity);
router.post("/approve-proof", protect, requireRole("admin"), admin.approveProfitProof);

// ✅ addresses
router.get("/addresses", protect, requireRole("admin"), admin.getAddresses);
router.post("/addresses", protect, requireRole("admin"), admin.updateAddresses);

module.exports = router;