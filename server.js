require("dotenv").config();
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth.routes");
const investorRoutes = require("./routes/investor.routes");
const traderRoutes = require("./routes/trader.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => res.send("VANCROX Backend Running ✅"));

app.use("/api/auth", authRoutes);
app.use("/api/investor", investorRoutes);
app.use("/api/trader", traderRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log("Server running on port", PORT));
});
