const { Router } = require("express");
const router = Router();

const adminModel = require("../models/adminModel");
const productModel = require("../models/productModel");
const { validateToken } = require("../services/authServices");

router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const alreadyRegAdmin = await adminModel.findOne({ email });
    if (alreadyRegAdmin) {
      res.json({ error: "Admin already registered" });
    }
    const admin = new adminModel({ name, email, password });
    await admin.save();
    res.json({ message: "Admin registered successfully" });
  } catch (e) {
    res.json({
      error: "All fields are required",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const verifiedAdminCookie = await adminModel.verifyPassAndcreateToken(
      email,
      password
    );
    res.cookie("cookie", verifiedAdminCookie);
    res.json({ message: "Admin logged in successfully" });
  } catch (error) {
    res.json({ error: "Incorrect email or Password" });
  }
});

router.post("/addProduct", async (req, res) => {
  const tokenCookieVal = req.cookies.cookie;
  if (!tokenCookieVal) {
    return res.json({ error: "Login In first" });
  }

  const loggedInAdmin = await validateToken(tokenCookieVal);
  const { name, price, category, description } = req.body;
  const admin = await adminModel.findOne({ _id: loggedInAdmin.id });
  try {
    const product = await productModel.create({ name, price, category, description });
    console.log(product);
    admin.products.push(product._id);
    await admin.save()
    res.json({ message: "Product added successfully" });
  } catch (e) {
    console.log(e);
    res.json({ error: "All fields are required" });
  }
});

router.get("/viewProducts",async (req, res) => {
  const loggedInAdmin = req.user;
  const admin = await adminModel
    .findOne({ email: loggedInAdmin.email })
    .populate("products");
  res.json(admin.products);
});

router.get("/logout", (req, res) => {
  res.clearCookie("cookie");
});

module.exports = router;
