const express = require('express');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("./routes/auth");

dotenv.config();
connectDB();

// Start cron job for email reminders (runs automatically every minute)
require("./cron/reminderCron");
console.log("✅ Email reminder cron job started");

const app = express();
const port = 3000;

const methodOverride = require("method-override");
app.use(methodOverride("_method"));

app.use(express.static("public"));


// View engine
app.set("view engine", "ejs");

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Load Models (so mongoose registers them)
require("./models/user");
//require("./models/task"); --> already required in below dashboard route

// Passport Config (import your passport setup)
require("./config/passport")(passport);

// Express Session (for storing login sessions)
app.use(
  session({
    secret: "yourSecretKey", // change to something random or store in .env
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport & use session
app.use(passport.initialize());
app.use(passport.session());

// Flash messages (optional)
app.use(flash());

app.use((req, res, next) => {
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});


// Routes
app.use("/auth", authRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/tasks", taskRoutes);

const chatRoutes = require("./routes/chat");
app.use("/api/chat", chatRoutes);

// Dashboard route
const Task = require("./models/task");
const isAuthenticated = require("./middlewares/auth");

app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, sort, filter } = req.query;

    // Build filter
    const query = { userId };
    
    // Handle special filters
    let pageTitle = "My Day";
    let pageIcon = "bi-sun";
    let allTasks = await Task.find({ userId }).sort({ createdAt: -1 }).lean();
    
    if (filter === "completed") {
      query.completed = true;
      pageTitle = "Completed";
      pageIcon = "bi-check-circle";
    } else if (filter === "planned") {
      // Planned: Tasks with due dates (both completed and incomplete)
      query.dueDate = { $ne: null };
      query.completed = false; // Only show incomplete planned tasks
      pageTitle = "Planned";
      pageIcon = "bi-calendar-event";
    } else if (filter === "important") {
      query.category = "important";
      pageTitle = "Important";
      pageIcon = "bi-star";
    } else if (category && category !== "all") {
      query.category = category;
      pageTitle = category;
      pageIcon = "bi-tag-fill";
    } else {
      // My Day - show incomplete tasks
      query.completed = false;
    }

    // Build sort
    let sortObj = { createdAt: -1 };
    if (sort === "due_asc") sortObj = { dueDate: 1, createdAt: -1 };
    else if (sort === "due_desc") sortObj = { dueDate: -1, createdAt: -1 };

    // Fetch filtered tasks
    const tasks = await Task.find(query).sort(sortObj).lean();

    // Get category list
    const categories = await Task.distinct("category", { userId });

    res.render("dashboard", {
      user: req.user,
      tasks,
      allTasks,
      categories: ["all", ...categories.filter(Boolean)],
      selectedCategory: category || "all",
      selectedSort: sort || "created_desc",
      currentFilter: filter || "my-day",
      pageTitle,
      pageIcon
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Notes routes
const noteRoutes = require("./routes/notes");
app.use("/notes", noteRoutes);



// Root route
app.get("/", (req, res) => {
  res.render("home", { title: "TaskHub - Home" });
});



// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
