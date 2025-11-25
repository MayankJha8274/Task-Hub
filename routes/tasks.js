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
  const { title, category, dueDate, remindBeforeMinutes } = req.body;

  await Task.create({
    title,
    category,
    dueDate,
    remindBeforeMinutes,
    userId: req.user._id
  });

  res.redirect("/dashboard");
});


// POST /tasks/:id/update → Update task
router.post("/:id/update", isAuthenticated, async (req, res) => {
  const { title, description, completed, category, dueDate, reminder } = req.body;

  try {
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (completed !== undefined) updateData.completed = completed === 'true' || completed === true;
    if (category !== undefined) updateData.category = category;
    if (dueDate !== undefined) updateData.dueDate = dueDate;
    if (reminder !== undefined) {
      updateData.reminder = reminder;
      updateData.reminderSent = false; // Reset reminder sent status
    }

    await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updateData
    );

    res.redirect("/dashboard");
  } catch (error) {
    res.status(500).json({ message: "Error updating task" });
  }
});

// Show Edit Form
router.get("/:id/edit", isAuthenticated, async (req, res) => {
  const task = await Task.findById(req.params.id);

  if (!task) return res.redirect("/dashboard");

  res.render("edits", { task, user: req.user, title: "Edit Task" });
});

// Update Task
router.post("/:id/edit", isAuthenticated, async (req, res) => {
  const { title, category, dueDate, remindBeforeMinutes, description } = req.body;

  await Task.findByIdAndUpdate(req.params.id, {
    title,
    category,
    dueDate,
    remindBeforeMinutes,
    description
  });

  res.redirect("/dashboard");
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

// GET /tasks/check-reminders → Check for due reminders
router.get("/check-reminders", isAuthenticated, async (req, res) => {
  try {
    const now = new Date();
    
    // Find tasks with reminders that are due
    const tasks = await Task.find({
      userId: req.user._id,
      reminder: { $lte: now },
      reminderSent: false,
      completed: false
    });

    // Mark reminders as sent
    if (tasks.length > 0) {
      await Task.updateMany(
        { _id: { $in: tasks.map(t => t._id) } },
        { reminderSent: true }
      );
    }

    res.json({ reminders: tasks });
  } catch (error) {
    console.error("Error checking reminders:", error);
    res.status(500).json({ error: "Error checking reminders" });
  }
});


module.exports = router;
