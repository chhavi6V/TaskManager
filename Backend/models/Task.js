const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: String,
    startTime: Date,
    endTime: Date,
    priority: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ["pending", "finished"] },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
