require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Admin = require("./models/Admin");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const email = "admin@site.com";
  const password = "admin123";

  const exists = await Admin.findOne({ email });
  if (exists) {
    console.log("Admin already exists");
    process.exit();
  }

  const hash = await bcrypt.hash(password, 10);

  await Admin.create({ name: "Admin", email, password: hash });
  console.log("✅ Admin created:", email, password);
  process.exit();
});
