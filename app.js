const express = require('express');
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const passport = require("passport");
const session = require("express-session");
const flash = require("connect-flash");
const authRoutes = require("./routes/auth");

dotenv.config();
connectDB();

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
  next();
});


// Routes
app.use("/auth", authRoutes);

const taskRoutes = require("./routes/tasks");
app.use("/tasks", taskRoutes);

// Dashboard route
const Task = require("./models/task");
const isAuthenticated = require("./middlewares/auth");

app.get("/dashboard", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;
    const { category, sort } = req.query; // example: ?category=Work&sort=due_asc

    // Build filter
    const filter = { userId };
    if (category && category !== "all") filter.category = category;

    // Build sort
    let sortObj = { createdAt: -1 }; // default: newest first
    if (sort === "due_asc") sortObj = { dueDate: 1, createdAt: -1 };
    else if (sort === "due_desc") sortObj = { dueDate: -1, createdAt: -1 };

    // Fetch tasks with filter and sort
    const tasks = await Task.find(filter).sort(sortObj).lean();

    // Get category list for dropdown (distinct categories for this user)
    const categories = await Task.distinct("category", { userId });

    res.render("dashboard", {
      user: req.user,
      tasks,
      categories: ["all", ...categories.filter(Boolean)],
      selectedCategory: category || "all",
      selectedSort: sort || "created_desc"
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
