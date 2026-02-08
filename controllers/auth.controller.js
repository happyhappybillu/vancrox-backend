const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const JWT_SECRET = process.env.JWT_SECRET || "vancrox_secret_key_9988";
const JWT_EXPIRE = "7d";

/* ===========================
   TOKEN HELPER
=========================== */
const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRE }
  );
};

/* ===========================
   INVESTOR REGISTER
=========================== */
exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Invalid details" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { mobile }].filter(Boolean),
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const last = await User.findOne({ role: "investor" }).sort({ uid: -1 });
    const uid = last?.uid ? last.uid + 1 : 100001;

    const user = await User.create({
      role: "investor",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      uid,
      balance: 0,
    });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      role: "investor",
      uid: user.uid,
    });
  } catch (e) {
    console.error("Register Investor Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   TRADER REGISTER
=========================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password || (!email && !mobile)) {
      return res.status(400).json({ message: "Invalid details" });
    }

    const exists = await User.findOne({
      $or: [{ email }, { mobile }].filter(Boolean),
    });

    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const last = await User.findOne({ role: "trader" }).sort({ tid: -1 });
    const tid = last?.tid ? last.tid + 1 : 500001;

    const user = await User.create({
      role: "trader",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      tid,
      securityBalance: 0,
    });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      role: "trader",
      tid: user.tid,
    });
  } catch (e) {
    console.error("Register Trader Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   LOGIN (INVESTOR / TRADER)
=========================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    }).select("+password");

    if (!user || !user.password) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      uid: user.uid || null,
      tid: user.tid || null,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    });
  } catch (e) {
    console.error("Login Error:", e);
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
   CHANGE PASSWORD
=========================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok) {
      return res.status(400).json({ message: "Old password incorrect" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

// ================= ADMIN LOGIN =================
exports.adminLogin = async (req, res) => {
  const { emailOrMobile, password } = req.body;

  const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
  const ADMIN_PASS = process.env.ADMIN_PASS;

  if (
    emailOrMobile === ADMIN_EMAIL &&
    password === ADMIN_PASS
  ) {
    const token = jwt.sign(
      { id: "admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({
      success: true,
      token,
      role: "admin",
      name: "Admin",
    });
  }

  return res.status(401).json({ message: "Invalid admin credentials" });
};
