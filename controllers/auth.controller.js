const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateUID, generateTID } = require("../utils/uidTid");

function makeToken(user) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment variables!");
  }
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

// ✅ ADMIN TOKEN
function makeAdminToken(email) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET missing in environment variables!");
  }
  return jwt.sign({ role: "admin", email }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

/* ===========================
   REGISTER INVESTOR
   =========================== */
exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) return res.status(400).json({ message: "Invalid" });
    if (!email && !mobile) return res.status(400).json({ message: "Invalid" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) return res.status(400).json({ message: "Invalid" });

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
    console.log("registerInvestor error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   REGISTER TRADER
   =========================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) return res.status(400).json({ message: "Invalid" });
    if (!email && !mobile) return res.status(400).json({ message: "Invalid" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    });

    if (exists) return res.status(400).json({ message: "Invalid" });

    const tid = await generateTID();
    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      role: "trader",
      name,
      email: email || "",
      mobile: mobile || "",
      password: hashed,
      tid,
      securityMoney: 0, // optional
    });

    const token = makeToken(user);

    res.json({ success: true, token, role: user.role, tid: user.tid });
  } catch (e) {
    console.log("registerTrader error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   LOGIN (Investor/Trader)
   =========================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password)
      return res.status(400).json({ message: "Invalid" });

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user) return res.status(400).json({ message: "Invalid" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid" });

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
    console.log("login error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   ME
   =========================== */
exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};

/* ===========================
   ✅ ADMIN LOGIN (NEW)
   POST /api/auth/admin/login
   =========================== */
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json({ message: "Invalid" });

    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASS = process.env.ADMIN_PASS;

    if (!ADMIN_EMAIL || !ADMIN_PASS) {
      return res.status(500).json({ message: "Admin credentials missing" });
    }

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return res.status(400).json({ message: "Invalid" });
    }

    const token = makeAdminToken(email);

    res.json({
      success: true,
      token,
      email,
      name: "Admin"
    });

  } catch (e) {
    console.log("adminLogin error:", e);
    res.status(500).json({ message: "Server error" });
  }
};
