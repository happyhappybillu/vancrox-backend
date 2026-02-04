const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "vancrox_secret_key_9988";

exports.protect = async (req, res, next) => {
  try {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // master admin support
    if (decoded.id === "master_admin") {
      req.user = { id: "master_admin", role: "admin", name: "Main Admin" };
      return next();
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ success: false, message: "User not found" });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

// ✅ MUST return a function (middleware)
exports.requireRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user) return res.status(401).json({ success: false, message: "Not authorized" });

      // master admin always admin
      if (req.user.id === "master_admin") return next();

      if (req.user.role !== role) {
        return res.status(403).json({ success: false, message: "Forbidden" });
      }

      next();
    } catch (e) {
      return res.status(403).json({ success: false, message: "Forbidden" });
    }
  };
};