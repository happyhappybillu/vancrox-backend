const mongoose = require("mongoose");

/* ================= REPLIES ================= */
const supportReplySchema = new mongoose.Schema(
  {
    senderRole: {
      type: String,
      enum: ["investor", "trader", "system"],
      required: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ================= TICKET ================= */
const supportTicketSchema = new mongoose.Schema(
  {
    /* =========================
       WHO CREATED TICKET
    ========================= */
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    role: {
      type: String,
      enum: ["investor", "trader"],
      required: true,
      index: true,
    },

    uid: {
      type: Number,
      default: null,
      index: true,
    },

    tid: {
      type: Number,
      default: null,
      index: true,
    },

    /* =========================
       TICKET CONTENT
    ========================= */
    subject: {
      type: String,
      default: "Support Request",
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },

    /* =========================
       STATUS FLOW
    ========================= */
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
      index: true,
    },

    /* =========================
       CHAT CONVERSATION
    ========================= */
    replies: {
      type: [supportReplySchema],
      default: [],
    },

    /* =========================
       UNREAD FLAGS 🔔
       (UI badges ke liye)
    ========================= */
    hasUnreadUser: {
      type: Boolean,
      default: false, // admin ke liye
    },

    hasUnreadSystem: {
      type: Boolean,
      default: false, // user ke liye
    },

    /* =========================
       LAST MESSAGE PREVIEW ⚡
       (fast UI load)
    ========================= */
    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },

    /* =========================
       META
    ========================= */
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/* ================= INDEXES ================= */
supportTicketSchema.index({ userId: 1, createdAt: -1 });
supportTicketSchema.index({ status: 1, hasUnreadUser: 1 });

module.exports = mongoose.model("SupportTicket", supportTicketSchema);