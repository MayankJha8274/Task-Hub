const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify connection on startup
transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ Email configuration error:', error.message);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

module.exports = transporter;
