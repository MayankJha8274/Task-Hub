const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

// 🧾 Register (POST /auth/register)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1️⃣ Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 2️⃣ Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3️⃣ Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 📄 Show Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// 📄 Show Login Page
router.get("/login", (req, res) => {
  res.render("login");
});


// 🔐 Login (POST /auth/login)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
});


// 🚪 Logout (GET /auth/logout)
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ message: "Logout failed" });
    res.redirect("/auth/login");
  });
});

module.exports = router;
