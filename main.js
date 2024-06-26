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

// Endpoint to create a new task
app.post("/create/task", async (req, res) => {
  try {
    const { title, content } = req.body;

    console.log({ title, content });
    // Create a new task with default status "TODO"
    const newTask = new CreateTaskData({
      title,
      content,
      status: "TODO",
    });

    // Save the new task to the database
    const data = await newTask.save();

    res.status(201).json({ message: "Task created successfully", data: data });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/task/status/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const updateStatus = await CreateTaskData.findByIdAndUpdate(
      id,
      { status: status },
      { new: true }
    );

    if (!updateStatus) {
      res.status(400).json({ error: "Task notfound" });
    }
    res.status(200).json({
      message: "Task status updated successfully",
      data: updateStatus,
    });
  } catch (error) {
    console.log("TASK STATUS UPDATED ERROR", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/task/:status", async (req, res) => {
  const { status } = req.params;

  try {
    const tasks = await CreateTaskData.find({ status });
    res.status(200).json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/user/update/:id", async (req, res) => {
  const { id } = req.params;

  const { userName, email, password } = req.body;

  try {
    const user = await SignUpData.findByIdAndUpdate(
      id,
      { userName: userName, email: email, password: password },
      { new: true }
    );

    if (!user) {
      res.status(400).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "Detail Updated Successfully", data: user });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.put("/task/:id/:status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.params;

  try {
    const updateTask = await CreateTaskData.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updateTask) {
      return res.status(404).json({ error: "Task not found" });
    }

    res.status(200).json({ message: "Task status updated successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/user/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await SignUpData.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User Deleted Successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.delete("/delete/task/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const task = await CreateTaskData.findByIdAndDelete(id);

    if (!task) {
      return res.status(400).json({ error: "Task Deleted Successfullly" });
    }
    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error updating task status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT} number`));
