const router = require("express").Router();
const investor = require("../controllers/investor.controller");
const notification = require("../controllers/notification.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* 🔐 Lock all routes */
router.use(protect, requireRole("investor"));

/* ================= PROFILE ================= */
router.get("/profile", investor.profile);

/* ================= TRADERS ================= */
router.get("/top-traders", investor.topTraders);

/* ================= HIRE ================= */
router.post("/hire", investor.hireTrader);

/* ================= MY TRADERS ================= */
router.get("/my-traders", investor.myTraders);

/* ================= HISTORY ================= */
router.get("/history", investor.history);

/* ================= SYSTEM ADDRESS ================= */
router.get("/system-address", investor.systemAddress);

/* ================= WITHDRAW ================= */
router.post("/withdraw", investor.withdrawRequest);

/* ================= NOTIFICATIONS ================= */
router.get("/notifications", notification.getInvestorNotifications);

module.exports = router;