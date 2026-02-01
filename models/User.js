const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    // यूजर का रोल: investor, trader या admin
    role: { 
      type: String, 
      enum: ["investor", "trader", "admin"], 
      required: true 
    },

    name: { type: String, required: true },

    // email और mobile को unique रखा है ताकि एक ही ईमेल से दो अकाउंट न बनें
    // sparse: true का मतलब है कि अगर कोई ईमेल नहीं देता, तो भी एरर न आए
    email: { 
      type: String, 
      unique: true, 
      sparse: true, 
      default: null 
    },
    
    mobile: { 
      type: String, 
      unique: true, 
      sparse: true, 
      default: null 
    },

    password: { type: String, required: true },

    // UID और TID को 0 के बजाय null रख रहे हैं ताकि ढूंढने में आसानी हो
    uid: { type: Number, default: null, index: true }, 
    tid: { type: Number, default: null, index: true }, 

    profilePhoto: { type: String, default: "" },

    // यूजर को ब्लॉक करने की सुविधा
    isBlocked: { type: Boolean, default: false },
  },
  { 
    timestamps: true // इससे खुद पता चलेगा कि यूजर कब रजिस्टर हुआ
  }
);

module.exports = mongoose.model("User", userSchema);
