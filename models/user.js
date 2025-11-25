const mongoose = require("mongoose");

// Define schema for User collection
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}, { timestamps: true }); // adds createdAt and updatedAt automatically

// Export model so it can be used anywhere in the project
module.exports = mongoose.model("User", userSchema);
