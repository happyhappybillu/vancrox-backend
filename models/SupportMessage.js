const mongoose = require("mongoose");

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
       OPEN -> RESOLVED
    ========================= */
    status: {
      type: String,
      enum: ["OPEN", "RESOLVED"],
      default: "OPEN",
      index: true,
    },

    /* =========================
       REPLIES (BOTH SIDES)
    ========================= */
    replies: {
      type: [supportReplySchema],
      default: [],
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

module.exports = mongoose.model("SupportTicket", supportTicketSchema);