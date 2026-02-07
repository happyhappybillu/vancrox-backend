const router = require("express").Router();
const support = require("../controllers/support.controller");
const { protect, requireRole } = require("../middleware/auth.middleware");

/* =====================================
   INVESTOR / TRADER
===================================== */

// create support ticket
router.post(
  "/create",
  protect,
  requireRole("investor"), // trader bhi same route use karega
  support.createTicket
);

// trader ke liye bhi allow
router.post(
  "/create-trader",
  protect,
  requireRole("trader"),
  support.createTicket
);

// get my active ticket (OPEN)
router.get(
  "/my",
  protect,
  support.getMyTicket
);

// reply to ticket (investor / trader)
router.post(
  "/reply",
  protect,
  support.replyToTicket
);

/* =====================================
   SYSTEM PANEL (ADMIN ROLE)
===================================== */

// all open tickets
router.get(
  "/system/all",
  protect,
  requireRole("admin"),
  support.getAllOpenTickets
);

// view single ticket (full conversation)
router.get(
  "/system/:id",
  protect,
  requireRole("admin"),
  support.getTicketById
);

// system reply
router.post(
  "/system/reply",
  protect,
  requireRole("admin"),
  support.systemReply
);

// resolve ticket
router.post(
  "/system/resolve",
  protect,
  requireRole("admin"),
  support.resolveTicket
);

module.exports = router;