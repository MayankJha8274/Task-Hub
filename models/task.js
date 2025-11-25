const mongoose = require("mongoose");

// Define schema for Task collection
const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  completed: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",   // connects each task to a specific user
    required: true
  },
  category: {
    type: String
  },
  reminderSent: {
  type: Boolean,
  default: false
},
remindBeforeMinutes: {
  type: Number,
  default: 60
},
dueDate: Date

}, { timestamps: true });

// Export model
module.exports = mongoose.model("Task", taskSchema);
