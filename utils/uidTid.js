const User = require("../models/User");

async function generateUID() {
  try {
    // डेटाबेस में सबसे बड़ा UID नंबर ढूंढें जो 5000 या उससे बड़ा हो
    const last = await User.findOne({ role: "investor", uid: { $gte: 5000 } })
      .sort({ uid: -1 }) // सबसे बड़ा नंबर पहले लाएं
      .lean();

    // अगर नंबर मिला तो उसमें 1 जोड़ें, वरना सीधा 5000 से शुरू करें
    return last ? last.uid + 1 : 5000;
  } catch (e) {
    console.error("UID Error:", e);
    return 5000; // एरर आने पर भी 5000 से ही शुरू करें
  }
}

async function generateTID() {
  try {
    // ट्रेडर के लिए सबसे बड़ा TID नंबर ढूंढें
    const last = await User.findOne({ role: "trader", tid: { $gte: 5000 } })
      .sort({ tid: -1 })
      .lean();

    // अगर नंबर मिला तो उसमें 1 जोड़ें, वरना सीधा 5000 से शुरू करें
    return last ? last.tid + 1 : 5000;
  } catch (e) {
    console.error("TID Error:", e);
    return 5000;
  }
}

module.exports = { generateUID, generateTID };
