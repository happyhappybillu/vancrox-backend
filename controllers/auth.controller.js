const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateUID, generateTID } = require("../utils/uidTid");

// ✅ JWT Secret env se lo
const JWT_SECRET = process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "vancrox_secret_key_9988";

function makeToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

/* ===========================
   INVESTOR REGISTRATION
   =========================== */
exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password)
      return res.status(400).json({ success: false, message: "Name & Password missing" });

    if (!email && !mobile)
      return res.status(400).json({ success: false, message: "Contact info missing" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) return res.status(400).json({ success: false, message: "Already registered" });

    const uid = await generateUID();
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "investor",
      name,
      email: email || "",
      mobile: mobile || "",
      password: hashed,
      uid,
    });

    const token = makeToken(user);
    res.json({ success: true, token, role: user.role, uid: user.uid });

  } catch (e) {
    console.error("Register Investor Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   TRADER REGISTRATION
   =========================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password)
      return res.status(400).json({ success: false, message: "Details missing" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) return res.status(400).json({ success: false, message: "User exists" });

    const tid = await generateTID();
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "trader",
      name,
      email: email || "",
      mobile: mobile || "",
      password: hashed,
      tid,
    });

    const token = makeToken(user);
    res.json({ success: true, token, role: user.role, tid: user.tid });

  } catch (e) {
    console.error("Register Trader Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   USER LOGIN (INVESTOR/TRADER)
   ✅ ONLY DB LOGIN
   =========================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Incorrect password" });

    const token = makeToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      uid: user.uid || 0,
      tid: user.tid || 0,
      name: user.name || "",
      email: user.email || "",
      mobile: user.mobile || "",
    });

  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   ✅ ADMIN LOGIN (ENV Based)
   ✅ Render ENV match: ADMIN_EMAIL, ADMIN_PASS
   =========================== */
exports.adminLogin = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    // ✅ EXACT env keys (as per your screenshot)
    const masterAdmin = (process.env.ADMIN_EMAIL || "").trim();
    const masterPass = (process.env.ADMIN_PASS || "").trim();

    // backup support (optional)
    const legacyAdmin = (process.env.ADMIN || "").trim();
    const legacyPass = (process.env.password || "").trim();

    const validEmail = emailOrMobile;

    const isMatch =
      (masterAdmin && masterPass && validEmail === masterAdmin && password === masterPass) ||
      (legacyAdmin && legacyPass && validEmail === legacyAdmin && password === legacyPass);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: "master_admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      role: "admin",
      name: "Main Control Panel",
      uid: 5000,
      email: validEmail,
    });

  } catch (e) {
    console.error("Admin Login Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   GET MY PROFILE
   =========================== */
exports.me = async (req, res) => {
  if (req.user && req.user.id === "master_admin") {
    return res.json({
      success: true,
      user: { name: "Main Admin", role: "admin" }
    });
  }
  res.json({ success: true, user: req.user });
};