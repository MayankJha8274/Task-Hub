const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const isAuthenticated = require("../middlewares/auth");

// GET /tasks → Show all tasks for logged-in user
router.get("/", isAuthenticated, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id });
    res.json({ tasks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching tasks" });
  }
});

// POST /tasks/add → Create new task
router.post("/add", isAuthenticated, async (req, res) => {
  const { title, description, category, dueDate } = req.body;

  try {
    const newTask = new Task({
      title,
      description,
      category,
      dueDate,
      userId: req.user._id
    });

    await newTask.save();
    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error adding task" });
  }
});

// POST /tasks/:id/update → Update task
router.post("/:id/update", isAuthenticated, async (req, res) => {
  const { title, description, completed, category, dueDate } = req.body;

  try {
    await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { title, description, completed, category, dueDate }
    );

    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// POST /tasks/:id/delete → Delete task
router.post("/:id/delete", isAuthenticated, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error deleting task" });
  }
});

module.exports = router;
