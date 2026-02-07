const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateUID, generateTID } = require("../utils/uidTid");

/* =====================================================
   CONFIG
===================================================== */
const JWT_SECRET =
  process.env.JWT_SECRET ||
  process.env.JWT_SECRET_KEY ||
  "vancrox_secret_key_9988";

const JWT_EXPIRE = "7d";

/* =====================================================
   TOKEN GENERATOR
===================================================== */
function makeToken(user) {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
}

/* =====================================================
   INVESTOR REGISTER
===================================================== */
exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password required",
      });
    }

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile required",
      });
    }

    // 🔍 duplicate check
    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Account already exists. Please login.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const uid = await generateUID(); // ✅ utils se UID

    const user = await User.create({
      role: "investor",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      uid,
    });

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Investor registered successfully",
      token,
      role: "investor",
      uid: `UID${user.uid}`,
    });
  } catch (err) {
    console.error("Investor Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   TRADER REGISTER
===================================================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({
        success: false,
        message: "Name and password required",
      });
    }

    if (!email && !mobile) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile required",
      });
    }

    // 🔍 duplicate check
    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Account already exists. Please login.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);
    const tid = await generateTID(); // ✅ utils se TID

    const user = await User.create({
      role: "trader",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      tid,
    });

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Trader registered successfully",
      token,
      role: "trader",
      tid: `TID${user.tid}`,
    });
  } catch (err) {
    console.error("Trader Register Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   LOGIN (INVESTOR / TRADER)
   - role auto detect
===================================================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({
        success: false,
        message: "Credentials required",
      });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Account not found",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account blocked by system",
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    const token = makeToken(user);

    return res.json({
      success: true,
      message: "Login successful",
      token,
      role: user.role,
      uid: user.uid ? `UID${user.uid}` : null,
      tid: user.tid ? `TID${user.tid}` : null,
      name: user.name,
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   ADMIN LOGIN (SYSTEM / ENV BASED)
===================================================== */
exports.adminLogin = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
    const adminPass = (process.env.ADMIN_PASS || "").trim();

    if (!adminEmail || !adminPass) {
      return res.status(500).json({
        success: false,
        message: "Admin not configured",
      });
    }

    if (emailOrMobile !== adminEmail || password !== adminPass) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      { id: "master_admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    return res.json({
      success: true,
      token,
      role: "admin",
      name: "System Control",
    });
  } catch (err) {
    console.error("Admin Login Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* =====================================================
   ME (PROFILE FETCH)
===================================================== */
exports.me = async (req, res) => {
  try {
    if (req.user?.id === "master_admin") {
      return res.json({
        success: true,
        user: {
          role: "admin",
          name: "System Control",
        },
      });
    }

    return res.json({
      success: true,
      user: req.user,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};