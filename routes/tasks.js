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
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed === 'true' || completed === true;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;

    await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData
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

// PUT /api/tasks/:id/complete → mark task completed
router.put("/api/:id/complete", isAuthenticated, async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { completed: true },
      { new: true }
    );

    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error completing task" });
  }
});

// DELETE /api/tasks/:id → delete task
router.delete("/api/:id", isAuthenticated, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting task" });
  }
});


module.exports = router;
