const router = require("express").Router();
const admin = require("../controllers/admin.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* DASHBOARD */
router.get("/dashboard", protect, requireRole("admin"), admin.dashboard);

/* USERS */
router.get("/users", protect, requireRole("admin"), admin.getUsers);
router.post("/users/:userId/block", protect, requireRole("admin"), admin.toggleBlockUser);

/* TRADER VERIFICATION */
router.post("/trader/approve-history", protect, requireRole("admin"), admin.approveTradingHistory);
router.post("/trader/reject-history", protect, requireRole("admin"), admin.rejectTradingHistory);

/* TRANSACTIONS */
router.get("/transactions/pending", protect, requireRole("admin"), admin.getPendingTransactions);
router.post("/transactions/approve", protect, requireRole("admin"), admin.approveTransaction);
router.post("/transactions/reject", protect, requireRole("admin"), admin.rejectTransaction);

/* PROFIT PROOFS */
router.get("/profit/pending", protect, requireRole("admin"), admin.getPendingProofs);
router.post("/profit/approve", protect, requireRole("admin"), admin.approveProfitProof);

/* SYSTEM ADDRESSES */
router.get("/addresses", protect, requireRole("admin"), admin.getAddresses);
router.post("/addresses", protect, requireRole("admin"), admin.updateAddresses);

/* NOTIFICATIONS */
router.post("/notifications", protect, requireRole("admin"), admin.createNotification);

/* SUPPORT */
router.get("/support", protect, requireRole("admin"), admin.getSupportTickets);
router.post("/support/reply", protect, requireRole("admin"), admin.replySupport);
router.post("/support/resolve", protect, requireRole("admin"), admin.resolveSupport);

module.exports = router;