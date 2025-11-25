const express = require("express");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const User = require("../models/user");
const crypto = require("crypto");
const transporter = require("../config/mailer");

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

// Show Forgot Password Page
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password");
});

// Handle Forgot Password Request
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      req.flash("error", "No account with that email address exists.");
      return res.redirect("/auth/forgot-password");
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetURL = `http://localhost:3000/auth/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: `"TaskHub" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "🔐 Password Reset Request - TaskHub",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>Hi ${user.name},</p>
          <p>You requested a password reset for your TaskHub account.</p>
          <p>Click the button below to reset your password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetURL}" style="background: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy this link: <a href="${resetURL}">${resetURL}</a></p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p style="color: #666; font-size: 12px;">If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log("✅ Password reset email sent to:", user.email);

    req.flash("success", "Password reset link sent to your email!");
    res.redirect("/auth/forgot-password");

  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
    console.error("Full error:", error);
    
    // More specific error messages
    let errorMessage = "Error sending email. Please try again.";
    if (error.code === 'EAUTH') {
      errorMessage = "Email authentication failed. Please contact administrator.";
    } else if (error.code === 'ESOCKET') {
      errorMessage = "Network error. Please check your internet connection.";
    }
    
    req.flash("error", errorMessage);
    res.redirect("/auth/forgot-password");
  }
});

// Show Reset Password Page
router.get("/reset-password/:token", async (req, res) => {
  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/auth/forgot-password");
    }

    res.render("reset-password", { token: req.params.token });
  } catch (error) {
    req.flash("error", "Error processing request.");
    res.redirect("/auth/forgot-password");
  }
});

// Handle Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    req.flash("error", "Please fill in all fields.");
    return res.redirect(`/auth/reset-password/${req.params.token}`);
  }

  if (password !== confirmPassword) {
    req.flash("error", "Passwords do not match.");
    return res.redirect(`/auth/reset-password/${req.params.token}`);
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      req.flash("error", "Password reset token is invalid or has expired.");
      return res.redirect("/auth/forgot-password");
    }

    // Update password
    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    req.flash("success", "Password successfully reset! You can now log in.");
    res.redirect("/auth/login");

  } catch (error) {
    console.error("Error resetting password:", error);
    req.flash("error", "Error resetting password. Please try again.");
    res.redirect("/auth/forgot-password");
  }
});

module.exports = router;
