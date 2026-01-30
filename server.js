require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

// ✅ CORS MUST be before routes
app.use(cors({
  origin: "*",
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ OPTIONS preflight
app.options("*", cors());

// ✅ Body parser MUST be before routes
app.use(express.json({ limit: "10mb" }));

// ✅ test route
app.get("/", (req, res) => res.send("VANCROX Backend Running ✅"));

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server Running on port:", PORT));
});
