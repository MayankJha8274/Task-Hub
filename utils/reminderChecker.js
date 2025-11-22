const Task = require("../models/task");

/**
 * Background reminder checker
 * Runs periodically to check for due reminders and log them
 * This runs on the server side (useful for email notifications later)
 */
async function checkReminders() {
  try {
    const now = new Date();
    
    // Find tasks with reminders that are due and haven't been sent
    const tasksToRemind = await Task.find({
      reminder: { $lte: now },
      reminderSent: false,
      completed: false
    }).populate('userId', 'name email');

    if (tasksToRemind.length === 0) {
      return; // No reminders due
    }

    console.log(`\n🔔 Checking reminders... Found ${tasksToRemind.length} due reminder(s)\n`);

    for (const task of tasksToRemind) {
      // Log reminder to server console
      console.log(`📋 REMINDER: Task "${task.title}" for user ${task.userId.name}`);
      console.log(`   Due: ${task.dueDate ? new Date(task.dueDate).toLocaleString() : 'No due date'}`);
      console.log(`   Category: ${task.category || 'None'}`);
      
      // Mark reminder as sent
      task.reminderSent = true;
      await task.save();
      
      // TODO: Here you can add email sending logic
      // Example: await sendReminderEmail(task.userId.email, task.title, task.dueDate);
    }

    console.log(`\n✅ Processed ${tasksToRemind.length} reminder(s)\n`);
  } catch (err) {
    console.error("❌ Error in reminder checker:", err);
  }
}

module.exports = checkReminders;
