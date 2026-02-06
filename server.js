require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

// routes
const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");
const notificationRoutes = require("./routes/notification.routes");

const app = express();

/* =====================
   MIDDLEWARES
===================== */
app.use(cors({
  origin: "*",
  credentials: true
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================
   HEALTH CHECK
===================== */
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "VANCROX Backend Running ✅"
  });
});

/* =====================
   API ROUTES
===================== */
app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/notifications", notificationRoutes);

/* =====================
   GLOBAL ERROR HANDLER
===================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({