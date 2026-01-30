require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

/* =========================
   IMPORTANT: CORS (Render + Netlify)
   ========================= */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Preflight
app.options("*", cors());

/* =========================
   Body Parser
   ========================= */
app.use(express.json({ limit: "10mb" }));

/* =========================
   Test Route
   ========================= */
app.get("/", (req, res) => {
  res.send("VANCROX Backend Running ✅");
});

/* =========================
   Routes
   ========================= */
app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/admin", adminRoutes);

/* =========================
   Server Start
   ========================= */
const PORT = process.env.PORT || 5000;

// ✅ Check JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.log("❌ JWT_SECRET missing in environment variables!");
} else {
  console.log("✅ JWT_SECRET loaded length:", process.env.JWT_SECRET.length);
}

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log("✅ Server Running on port:", PORT);
    });
  })
  .catch((err) => {
    console.log("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });
