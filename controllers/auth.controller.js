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

    if (!name || !password)
      return res.status(400).json({ message: "Name & password required" });

    if (!email && !mobile)
      return res.status(400).json({ message: "Email or mobile required" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    }).select("+password");

    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const last = await User.findOne({ role: "investor" }).sort({ uid: -1 });
    const nextUid = last?.uid ? last.uid + 1 : 100001;

    const user = await User.create({
      role: "investor",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      uid: nextUid,
      balance: 0,
    });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      uid: user.uid,
    });
  } catch (e) {
    console.error("Investor Register Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   TRADER REGISTER
=========================== */
exports.registerTrader = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password)
      return res.status(400).json({ message: "Name & password required" });

    if (!email && !mobile)
      return res.status(400).json({ message: "Email or mobile required" });

    const exists = await User.findOne({
      $or: [
        ...(email ? [{ email }] : []),
        ...(mobile ? [{ mobile }] : []),
      ],
    }).select("+password");

    if (exists)
      return res.status(400).json({ message: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const last = await User.findOne({ role: "trader" }).sort({ tid: -1 });
    const nextTid = last?.tid ? last.tid + 1 : 500001;

    const user = await User.create({
      role: "trader",
      name,
      email: email || null,
      mobile: mobile || null,
      password: hashed,
      tid: nextTid,
      traderLevel: 1,
      securityBalance: 0,
    });

    const token = signToken(user);

    res.json({
      success: true,
      token,
      role: user.role,
      tid: user.tid,
    });
  } catch (e) {
    console.error("Trader Register Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   LOGIN
=========================== */
exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password)
      return res.status(400).json({ message: "Credentials required" });

    const user = await User.findOne({
      $or: [{ email: emailOrMobile }, { mobile: emailOrMobile }],
    });

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" });

    if (user.isBlocked)
      return res.status(403).json({ message: "Account blocked" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: "Invalid credentials" });

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
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ===========================
   CHANGE PASSWORD
=========================== */
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword)
      return res.status(400).json({ message: "Old & new password required" });

    const user = await User.findById(req.user._id).select("+password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const ok = await bcrypt.compare(oldPassword, user.password);
    if (!ok)
      return res.status(400).json({ message: "Old password incorrect" });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
  } catch (e) {
    res.status(500).json({ message: "Server error" });
  }
};

/* ======================================================
   ADMIN LOGIN (ENV BASED – DB USER NAHI)
====================================================== */
exports.adminLogin = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) {
      return res.status(400).json({ message: "Credentials required" });
    }

    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "").trim();
    const ADMIN_PASS  = (process.env.ADMIN_PASS || "").trim();

    if (!ADMIN_EMAIL || !ADMIN_PASS) {
      return res.status(500).json({ message: "Admin credentials not configured" });
    }

    if (emailOrMobile !== ADMIN_EMAIL || password !== ADMIN_PASS) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { id: "master_admin", role: "admin" },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRE }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      role: "admin",
      name: "System Admin",
    });

  } catch (e) {
    console.error("Admin Login Error:", e);
    res.status(500).json({ message: "Server error" });
  }
};