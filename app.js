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

// View engine
app.set("view engine", "ejs");

// Body parsers
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Load Models (so mongoose registers them)
require("./models/user");
require("./models/task");

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
  const tasks = await Task.find({ userId: req.user._id });
  res.render("dashboard", { user: req.user, tasks });
});



// Root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
