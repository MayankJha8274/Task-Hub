const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");

const router = express.Router();

// Register (POST /auth/register)
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    req.flash("error", "All fields are required.");
    return res.redirect("/auth/register");
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash("error", "User already exists.");
      return res.redirect("/auth/register");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    req.flash("success", "Registration successful! You can now log in.");
    return res.redirect("/auth/login");

  } catch (error) {
    console.error("Error during registration:", error);
    req.flash("error", "Server error. Try again later.");
    return res.redirect("/auth/register");
  }
});


// Show Register Page
router.get("/register", (req, res) => {
  res.render("register");
});

// Show Login Page
router.get("/login", (req, res) => {
  res.render("login");
});

// Login (POST /auth/login)
router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/auth/login",
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      req.flash("error", "Logout failed.");
      return res.redirect("/dashboard");
    }
    req.flash("success", "Logged out successfully.");
    res.redirect("/auth/login");
  });
});

module.exports = router;
