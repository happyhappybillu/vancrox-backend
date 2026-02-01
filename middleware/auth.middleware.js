const jwt = require("jsonwebtoken");
const User = require("../models/User");

// हमने यहाँ एक 'Default' सीक्रेट की डाल दी है 
// ताकि .env फाइल न होने पर भी आपका ऐप क्रैश न हो।
const JWT_SECRET = process.env.JWT_SECRET || "vancrox_secret_key_9988";

exports.protect = async (req, res, next) => {
  try {
    let token;

    // चेक करें कि क्या हेडर में 'Bearer' टोकन है
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Login required" });
    }

    // टोकन को वेरीफाई करें
    const decoded = jwt.verify(token, JWT_SECRET);

    // यूजर को डेटाबेस में ढूंढें
    const user = await User.findById(decoded.id).select("-password");
    
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // अगर यूजर ब्लॉक है (Optional check)
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: "Your account is blocked" });
    }

    // यूजर का डेटा रिक्वेस्ट में सेव करें
    req.user = user;
    next();
  } catch (e) {
    console.error("Auth Middleware Error:", e.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

// रोल चेक करने का फंक्शन (जैसे: सिर्फ investor ही एक्सेस कर सके)
exports.requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ 
      success: false, 
      message: `Access denied: Only ${role} allowed` 
    });
  }
  next();
};
