const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createToken } = require("../services/authServices");

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  salt : {
    type : String,
  },
  password: {
    type: String,
    required: true,
  },
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "productModel",
    },
  ],
});

adminSchema.pre("save", function (next) {
  const admin = this;
  if (!admin.isModified("password")) return;
  const salt = randomBytes(16).toString();
  const hashedPassword = createHmac("sha256", salt)
    .update(admin.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashedPassword;
  next();
});

adminSchema.static(
  "verifyPassAndcreateToken",
  async function (email, password) {
    const admin = await this.findOne({ email });
    if (!admin) throw new Error("User not Found");

    const salt = admin.salt;
    const hashedPassword = admin.password;
    const adminPassHash = createHmac("sha256", salt)
      .update(password)
      .digest("hex");

    if (hashedPassword !== adminPassHash)
      throw new Error("Password is incorrect");

    const token = createToken(admin);

    return token;
  }
);

module.exports = mongoose.model("admin", adminSchema);
