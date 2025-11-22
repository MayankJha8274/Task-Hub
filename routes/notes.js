const express = require("express");
const router = express.Router();
const isAuthenticated = require("../middlewares/auth");
const Note = require("../models/Note");

// Show notes
router.get("/", isAuthenticated, async (req, res) => {
  const notes = await Note.find({ userId: req.user._id }).lean();
  res.render("notes", { user: req.user, notes });
});

// Add note
router.post("/add", isAuthenticated, async (req, res) => {
  const { title, content, progress } = req.body;

  await Note.create({
    title,
    content,
    progress,
    userId: req.user._id
  });

  res.redirect("/notes");
});

// Delete note
router.post("/:id/delete", isAuthenticated, async (req, res) => {
  await Note.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  res.redirect("/notes");
});

module.exports = router;
