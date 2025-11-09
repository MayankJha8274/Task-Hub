const express = require('express');
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

connectDB();

const app = express();
const port = 3000;

// 🔹 Parse JSON (important for API requests)
app.use(express.json());

// 🔹 Load Models (so mongoose registers them)
require("./models/User");
require("./models/Task");

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});