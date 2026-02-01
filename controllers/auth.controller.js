const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateUID, generateTID } = require("../utils/uidTid");

// JWT Secret: .env से लें या डिफॉल्ट इस्तेमाल करें
const JWT_SECRET = process.env.JWT_SECRET || "vancrox_secret_key_9988";

function makeToken(user) {
  return jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });
}

/* ===========================
   INVESTOR REGISTRATION
   =========================== */
exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) return res.status(400).json({ success: false, message: "Name & Password missing" });
    if (!email && !mobile) return res.status(400).json({ success: false, message: "Contact info missing" });

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
    console.error("Register Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   TRADER REGISTRATION
   =========================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) return res.status(400).json({ success: false, message: "Details missing" });

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
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   USER & ADMIN LOGIN
   =========================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
        return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    // 1. सबसे पहले Render के 'ADMIN' और 'password' वेरिएबल्स चेक करें
    const masterAdmin = process.env.ADMIN;     // जो आपने Render में 'ADMIN' नाम रखा है
    const masterPass = process.env.password;  // जो आपने Render में 'password' नाम रखा है

    if (masterAdmin && masterPass && emailOrMobile === masterAdmin && password === masterPass) {
      return res.json({
        success: true,
        token: jwt.sign({ id: "master_admin", role: "admin" }, JWT_SECRET, { expiresIn: "7d" }),
        role: "admin",
        name: "Main Control Panel",
        uid: 5000 
      });
    }

    // 2. अगर Render से मैच नहीं हुआ, तो डेटाबेस (MongoDB) में ढूंढें
    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) return res.status(400).json({ success: false, message: "User not found" });

    // पासवर्ड चेक
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ success: false, message: "Incorrect password" });

    const token = makeToken(user);
    res.json({
      success: true,
      token,
      role: user.role,
      uid: user.uid || 0,
      tid: user.tid || 0,
    });
  } catch (e) {
    console.error("Login Error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ===========================
   GET MY PROFILE
   =========================== */
exports.me = async (req, res) => {
  // अगर मास्टर एडमिन है तो डमी डेटा भेजें, वरना डेटाबेस का डेटा
  if (req.user && req.user.id === "master_admin") {
      return res.json({ success: true, user: { name: "Main Admin", role: "admin" } });
  }
  res.json({ success: true, user: req.user });
};
