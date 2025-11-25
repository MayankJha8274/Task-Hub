const express = require("express");
const router = express.Router();
const OpenAI = require("openai");
const Task = require("../models/task");
const Note = require("../models/Note");
const isAuthenticated = require("../middlewares/auth");

// Create Groq client (uses OpenAI SDK for compatibility)
const groqClient = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1"
});

// Check if key exists
if (!process.env.GROQ_API_KEY) {
  console.error("❌ ERROR: GROQ_API_KEY missing in .env file!");
} else {
  console.log("✅ Groq API key loaded:", process.env.GROQ_API_KEY.slice(0, 8) + "...");
}

// -----------------------------------------------------------
// POST /api/chat — chatbot endpoint
// -----------------------------------------------------------
router.post("/", isAuthenticated, async (req, res) => {
  const userMessage = req.body.message;
  const userId = req.user._id;

  try {
    // Fetch all tasks
    const tasks = await Task.find({ userId }).lean();
    const notes = await Note.find({ userId }).lean();

    // Convert tasks
    const taskSummary = tasks.length
      ? tasks
          .map(
            t =>
              `• ${t.title} (Category: ${t.category || "None"}, Completed: ${
                t.completed
              }, Due: ${
                t.dueDate ? new Date(t.dueDate).toDateString() : "No due date"
              })`
          )
          .join("\n")
      : "No tasks found.";

    // Convert notes
    const noteSummary = notes.length
      ? notes
          .map(n => `• ${n.title}: ${n.content} (Progress: ${n.progress}%)`)
          .join("\n")
      : "No notes found.";

    // -----------------------------------------
    // Call Groq Chat Model with Function Calling
    // -----------------------------------------
    const completion = await groqClient.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
You are TaskHub AI Assistant with task management capabilities.

Current user data:
===== TASKS =====
${taskSummary}

===== NOTES =====
${noteSummary}

You can:
1. View and analyze user's tasks and notes
2. Create new tasks when user asks (use the create_task function)
3. Help with planning and productivity

When user wants to add/create a task, use the create_task function.
`
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "create_task",
            description: "Create a new task for the user",
            parameters: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "The task title"
                },
                description: {
                  type: "string",
                  description: "Task description (optional)"
                },
                category: {
                  type: "string",
                  description: "Category: work, personal, shopping, or other"
                },
                dueDate: {
                  type: "string",
                  description: "Due date in YYYY-MM-DD format (optional)"
                }
              },
              required: ["title"]
            }
          }
        }
      ],
      tool_choice: "auto"
    });

    const message = completion.choices[0].message;

    // Check if AI wants to call a function
    if (message.tool_calls && message.tool_calls.length > 0) {
      const toolCall = message.tool_calls[0];
      
      if (toolCall.function.name === "create_task") {
        const args = JSON.parse(toolCall.function.arguments);
        
        // Create the task
        const newTask = new Task({
          userId: userId,
          title: args.title,
          description: args.description || "",
          category: args.category || "other",
          dueDate: args.dueDate || null,
          completed: false
        });
        
        await newTask.save();
        
        // Send confirmation message
        return res.json({ 
          reply: `✅ Task created successfully!\n\n**${args.title}**\n${args.description ? 'Description: ' + args.description + '\n' : ''}${args.category ? 'Category: ' + args.category + '\n' : ''}${args.dueDate ? 'Due: ' + args.dueDate : ''}\n\nYou can view it in your task list!`
        });
      }
    }

    // Normal text response
    const aiReply = message.content;
    res.json({ reply: aiReply });
  } catch (error) {
    console.error("❌ Chatbot Error:", error);
    res.status(500).json({
      reply: "Something went wrong. (" + error.message + ")"
    });
  }
});

module.exports = router;
