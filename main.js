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

//sign - up api endpoint
app.post("/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { userName, password, email } = req.body;

    //check that email exist or not
    const isEmailExist = await SignUpData.findOne({ email });

    console.log(isEmailExist);

    if (isEmailExist) {
      return res.status(400).json({ error: "Email already exists" });
    }

    //const create new user
    const newUser = new SignUpData({ userName, password, email });

    await newUser.save();

    res.status(201).json({ message: "User registred successfully" });
  } catch (error) {
    console.log("Error registering user : ", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  console.log(req.body);
  try {
    const { email, password } = req.body;

    const user = await SignUpData.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if the provided password matches the stored password
    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Login successful
    res.status(200).json({ message: "Login successful", data: user });
  } catch (error) {
    console.log("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT} number`));
