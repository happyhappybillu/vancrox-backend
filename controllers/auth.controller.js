const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { generateUID, generateTID } = require("../utils/uidTid");

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

exports.registerInvestor = async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    if (!name || !password) return res.status(400).json({ message: "Invalid" });
    if (!email && !mobile) return res.status(400).json({ message: "Invalid" });

    // unique check
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
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

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
    });

    const token = makeToken(user);
    res.json({ success: true, token, role: user.role, tid: user.tid });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { emailOrMobile, password } = req.body;

    if (!emailOrMobile || !password) return res.status(400).json({ message: "Invalid" });

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
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  res.json({ success: true, user: req.user });
};
