const { Router } = require("express");
const router = Router();

const userModel = require("../models/userModel");

router.post("/signup", async (req, res) => {
  const { fullname, email, password,contactNo } = req.body;
  try {
    const existingUser = await userModel.findOne({email})
    if (existingUser) {
      res.json({error : "user already registered"})
    }
    const user = new userModel({fullname,email,password,contactNo})
    await user.save();
    res.json({ message : "User registered successfully please login"});
  } catch (e) {
    res.json({
      error : "All fields are required",
    })
  }
 
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const verifiedUser = await userModel.verifyPassAndcreateToken(
      email,
      password
    );
    res.cookie("cookie", verifiedUser);
    res.json({ message: "User logged in successfully" });
  } catch (error) {
    res.json({ error: "Incorrect Username or Password" });
  }
});

router.get("/logout", (req, res) => {
  res.clearCookie("cookie").redirect("/");
});

module.exports = router;
