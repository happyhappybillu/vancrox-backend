require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const notificationRoutes = require("./routes/notification.routes");
const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// test route
app.get("/", (req, res) => {
  res.send("VANCROX Backend Running ✅");
});

// routes
app.use("/api", notificationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/admin", adminRoutes);

// ❗ GLOBAL ERROR HANDLER (IMPORTANT)
app.use((err, req, res, next) => {
  console.error("🔥 Error:", err.message);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;

// start server after DB connect
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("🚀 Server running on port", PORT);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });