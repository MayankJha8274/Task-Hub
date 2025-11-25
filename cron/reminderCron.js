const cron = require("node-cron");
const Task = require("../models/task");
const transporter = require("../config/mailer");
const User = require("../models/user");

// Run every minute
cron.schedule("* * * * *", async () => {
  console.log("⏰ Checking email reminders...");

  const now = new Date();

  // Tasks that have a dueDate and not reminded yet
  const tasks = await Task.find({
    reminderSent: false,
    dueDate: { $exists: true }
  }).populate("userId");

  for (let task of tasks) {
    if (!task.userId || !task.userId.email) continue;

    const due = new Date(task.dueDate);
    const remindTime = new Date(due.getTime() - task.remindBeforeMinutes * 60000);

    if (now >= remindTime) {
      // SEND EMAIL
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: task.userId.email,
        subject: `🔔 Reminder: ${task.title}`,
        html: `
          <h2>Task Reminder</h2>
          <p>Your task <b>${task.title}</b> is due soon!</p>
          <p>Due at: ${due.toLocaleString()}</p>
        `
      });

      // MARK AS SENT
      task.reminderSent = true;
      await task.save();

      console.log(`📧 Email sent for: ${task.title}`);
    }
  }
});

