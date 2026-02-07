const express = require("express");
const router = express.Router();

const supportController = require("../controllers/support.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* ======================================================
   INVESTOR / TRADER SUPPORT
====================================================== */

// create ticket
router.post(
  "/create",
  protect,
  supportController.createTicket
);

// get my tickets (investor / trader)
router.get(
  "/my",
  protect,
  supportController.getMyTickets
);

/* ======================================================
   ADMIN SUPPORT PANEL
====================================================== */

// get all open tickets
router.get(
  "/admin/all",
  protect,
  requireRole("admin"),
  supportController.getAllTickets
);

// view single ticket
router.get(
  "/admin/:id",
  protect,
  requireRole("admin"),
  supportController.viewTicket
);

// reply to ticket
router.post(
  "/admin/reply/:id",
  protect,
  requireRole("admin"),
  supportController.replyTicket
);

// resolve ticket
router.post(
  "/admin/resolve/:id",
  protect,
  requireRole("admin"),
  supportController.resolveTicket
);

module.exports = router;