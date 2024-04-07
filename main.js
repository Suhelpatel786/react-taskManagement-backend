const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const PORT = 3000;

app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/task", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// For allowing CORS
app.use(
  cors({
    methods: ["GET", "POST", "PUT", "DELETE"], // Only allow certain HTTP methods
    allowedHeaders: ["Content-Type"], // Only allow certain headers
    origin: "*", // Restrict access to a specific origin
  })
);

// Schemas
const signUpSchema = new mongoose.Schema({
  userName: String,
  password: String,
  email: String,
});

const loginSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const createTaskSchema = new mongoose.Schema({
  title: String,
  content: String,
  status: String,
});

// Collections

// login
const LoginData = mongoose.model("LoginData", loginSchema);

// Signup
const SignUpData = mongoose.model("SignUpData", signUpSchema);

// create task
const CreateTaskData = mongoose.model("CreateTaskData", createTaskSchema);

app.listen(PORT, () => console.log(`Server is running on ${PORT} number`));
