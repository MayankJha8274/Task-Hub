const mongoose = require("mongoose");

const NoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  progress: { type: Number, default: 0 }, // 0–100%
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Note", NoteSchema);
