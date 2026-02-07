/**
 * ================================
 * VANCROX – MAIN SERVER FILE
 * ================================
 * ✔ Production ready
 * ✔ Secure
 * ✔ Clean routing
 * ✔ No temporary logic
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const connectDB = require("./config/db");

/* ================================
   ROUTES
================================ */
const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");
const walletRoutes = require("./routes/wallet.routes");
const supportRoutes = require("./routes/support.routes");
const notificationRoutes = require("./routes/notification.routes");

/* ================================
   APP INIT
================================ */
const app = express();

/* ================================
   SECURITY & MIDDLEWARE
================================ */

// trust proxy (Render / Cloudflare safe)
app.set("trust proxy", 1);

// CORS (frontend + admin panel)
app.use(
  cors({
    origin: "*", // production me specific domain bhi laga sakte ho
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// JSON limit (proof images base64 ke liye)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// logs (production friendly)
app.use(morgan("dev"));

/* ================================
   STATIC FILES (optional)
================================ */
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

/* ================================
   API ROUTES
================================ */

app.get("/", (req, res) => {
  res.json({
    success: true,
    name: "VANCROX API",
    status: "RUNNING",
    time: new Date().toISOString(),
  });
});

// AUTH
app.use("/api/auth", authRoutes);

// INVESTOR
app.use("/api/investor", investorRoutes);

// TRADER
app.use("/api/trader", traderRoutes);

// WALLET (deposit / withdraw)
app.use("/api/wallet", walletRoutes);

// SYSTEM PANEL (ADMIN / TEAM)
app.use("/api/system", adminRoutes);

// SUPPORT / HELP
app.use("/api/support", supportRoutes);

// NOTIFICATIONS (admin → investor)
app.use("/api/notification", notificationRoutes);

/* ================================
   404 HANDLER
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/* ================================
   GLOBAL ERROR HANDLER
================================ */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

/* ================================
   SERVER START
================================ */
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 VANCROX Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed", err);
    process.exit(1);
  });