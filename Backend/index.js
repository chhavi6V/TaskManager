const express = require("express");
const connectDB = require("./utils/db_config");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(
  cors({
    origin: "https://task-manager-6jkz.vercel.app", 
    credentials: true,
  })
);

app.use(express.json());
app.get("/", (req,res) => {
    res.json("Hello");
})
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

const PORT = process.env.PORT || 8050;
app.listen(PORT, () => console.log(`Server running on port on ${PORT}`));

connectDB();
