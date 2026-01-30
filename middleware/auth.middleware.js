const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ MAIN AUTH MIDDLEWARE (default export)
async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;

    if (!token) return res.status(401).json({ message: "Unauthorized" });

    if (!process.env.JWT_SECRET) {
      console.log("JWT_SECRET missing!");
      return res.status(500).json({ message: "Server error" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ ADMIN TOKEN SUPPORT (no DB user required)
    // admin token payload: { role:"admin", email:"..." }
    if (decoded.role === "admin") {
      req.user = {
        role: "admin",
        email: decoded.email || "",
        name: "Admin",
      };
      return next();
    }

    // ✅ normal user token payload: { id:"..." }
    if (!decoded.id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    if (user.isBlocked) return res.status(403).json({ message: "Blocked" });

    req.user = user;
    next();
  } catch (e) {
    console.log("authMiddleware error:", e.message);
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// ✅ ROLE CHECK
function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    if (req.user.role !== role) {
      return res.status(403).json({ message: "Access denied" });
    }

    next();
  };
}

module.exports = authMiddleware;
module.exports.requireRole = requireRole;