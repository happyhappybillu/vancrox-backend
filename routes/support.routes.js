const express = require("express");
const router = express.Router();

const supportController = require("../controllers/support.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   INVESTOR / TRADER SUPPORT
====================================================== */

// Create support ticket
router.post(
  "/create",
  protect,
  requireRole("investor", "trader"),
  supportController.createTicket
);

// Get my tickets
router.get(
  "/my",
  protect,
  requireRole("investor", "trader"),
  supportController.getMyTickets
);

/* ======================================================
   SYSTEM TEAM PANEL (ADMIN)
====================================================== */

// Get all OPEN tickets
router.get(
  "/admin/all",
  protect,
  requireRole("admin"),
  supportController.getAllTickets
);

// View single ticket
router.get(
  "/admin/:id",
  protect,
  requireRole("admin"),
  supportController.viewTicket
);

// Reply to ticket
router.post(
  "/admin/reply/:id",
  protect,
  requireRole("admin"),
  supportController.replyTicket
);

// Resolve ticket
router.post(
  "/admin/resolve/:id",
  protect,
  requireRole("admin"),
  supportController.resolveTicket
);

module.exports = router;