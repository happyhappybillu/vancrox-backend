const SupportTicket = require("../models/SupportTicket");
const User = require("../models/User");

/* ======================================================
   CREATE SUPPORT TICKET (INVESTOR / TRADER)
====================================================== */
exports.createTicket = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required" });
    }

    const ticket = await SupportTicket.create({
      userId: req.user._id,
      uid: req.user.uid,
      name: req.user.name,
      role: req.user.role, // investor | trader
      message,
      status: "OPEN",
      replies: [],
    });

    res.json({
      success: true,
      message: "Support ticket created successfully",
      ticket,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   GET MY TICKETS (INVESTOR / TRADER)
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
   ADMIN: GET ALL OPEN TICKETS
====================================================== */
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await SupportTicket.find({ status: "OPEN" }).sort({
      createdAt: -1,
    });

    res.json({ success: true, tickets });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: VIEW SINGLE TICKET
====================================================== */
exports.viewTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    res.json({ success: true, ticket });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: REPLY TO TICKET
   (admin name use nahi hota – restricted)
====================================================== */
exports.replyTicket = async (req, res) => {
  try {
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply is required" });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.replies.push({
      sender: "ADMIN",
      message: reply,
      time: new Date(),
    });

    await ticket.save();

    res.json({
      success: true,
      message: "Reply sent successfully",
      ticket,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN: RESOLVE TICKET
   (resolve hote hi investor/trader side se bhi hide)
====================================================== */
exports.resolveTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    ticket.status = "RESOLVED";
    await ticket.save();

    res.json({
      success: true,
      message: "Ticket resolved successfully",
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};