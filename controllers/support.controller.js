const SupportTicket = require("../models/SupportTicket");

/* ======================================================
   CREATE TICKET (Investor / Trader)
====================================================== */
exports.createTicket = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message required" });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      role: req.user.role,          // investor | trader
      uid: req.user.uid || null,
      tid: req.user.tid || null,
      subject: subject || "Support Request",
      message,
      status: "OPEN",
      replies: [],
    });

    res.json({
      success: true,
      message: "Ticket created",
      ticket,
    });
  } catch (err) {
    console.error("CreateTicket Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET MY TICKETS (Investor / Trader)
====================================================== */
exports.getMyTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({
      userId: req.user._id,
    }).sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN / SYSTEM TEAM – GET ALL OPEN TICKETS
====================================================== */
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ status: "OPEN" })
      .populate("userId", "name email uid tid role")
      .sort({ createdAt: -1 });

    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   VIEW SINGLE TICKET
====================================================== */
exports.viewTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate("userId", "name email uid tid role");

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   REPLY TO TICKET (System Team)
====================================================== */
exports.replyTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Reply message required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.replies.push({
      senderRole: "system",   // investor | trader | system
      message,
      createdAt: new Date(),
    });

    await ticket.save();

    res.json({
      success: true,
      message: "Reply sent",
    });
  } catch (err) {
    console.error("ReplyTicket Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   RESOLVE TICKET
====================================================== */
exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = "RESOLVED";
    ticket.resolvedAt = new Date();

    await ticket.save();

    res.json({
      success: true,
      message: "Ticket resolved",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};