const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "vancroxJWT@2026#SuperSecret";

/* =====================================
   AUTH PROTECT (VERIFY TOKEN)
===================================== */
exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    let decoded;

    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    /* ===============================
       MASTER SYSTEM PANEL ADMIN
       (NO DB USER REQUIRED)
    =============================== */
    if (decoded.id === "master_admin") {
      req.user = {
        id: "master_admin",
        role: "admin",
        name: "System Panel",
      };
      return next();
    }

    /* ===============================
       NORMAL USER (INVESTOR / TRADER)
    =============================== */
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // 🚫 BLOCKED USER CHECK
    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked by system team",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Authorization failed",
    });
  }
};

/* =====================================
   ROLE BASED ACCESS CONTROL
===================================== */
exports.requireRole = (role) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Not authorized",
        });
      }

      // ✅ master admin always allowed
      if (req.user.id === "master_admin") {
        return next();
      }

      if (req.user.role !== role) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      next();
    } catch (err) {
      return res.status(403).json({
        success: false,
        message: "Forbidden",
      });
    }
  };
};