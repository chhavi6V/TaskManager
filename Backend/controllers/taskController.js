const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  const { title, startTime, endTime, priority, status } = req.body;

  try {
    if (!(title && startTime && priority && status)) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all mandatory fields: title, start time, priority, and status.",
      });
    }

    const newTask = await Task.create({
      title,
      startTime,
      endTime,
      priority,
      status,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully.",
      data: newTask,
    });
  } catch (err) {
    console.error("Error creating task:", err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while creating the task.",
    });
  }
};

exports.getTasks = async (req, res) => {
  const { priority, status, sortBy, order } = req.query;

  try {
    const queryFilter = { userId: req.user.id };
    if (priority) queryFilter.priority = priority;
    if (status) queryFilter.status = status;

    const sortCriteria = {};
    if (sortBy) sortCriteria[sortBy] = order === "desc" ? -1 : 1;

    const userTasks = await Task.find(queryFilter).sort(sortCriteria);

    res.status(200).json({
      success: true,
      message: `Found ${userTasks.length} task(s).`,
      data: userTasks,
    });
  } catch (err) {
    console.error("Error retrieving tasks:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tasks. Please try again later.",
    });
  }
};

exports.updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, startTime, endTime, priority, status } = req.body;

  try {
    const updatedTask = await Task.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { title, startTime, endTime, priority, status },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to modify it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task updated successfully.",
      data: updatedTask,
    });
  } catch (err) {
    console.error("Error updating task:", err.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the task.",
    });
  }
};

exports.deleteTask = async (req, res) => {
  const { id } = req.params;

  try {
    const removedTask = await Task.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!removedTask) {
      return res.status(404).json({
        success: false,
        message: "Task not found or you do not have permission to delete it.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully.",
    });
  } catch (err) {
    console.error("Error deleting task:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete the task. Please try again later.",
    });
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const tasks = await Task.find({ userId });

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "finished"
    ).length;

    const tasksCompletedPercentage = totalTasks
      ? (completedTasks / totalTasks) * 100
      : 0;

    const pendingTasks = tasks.filter((task) => task.status === "pending");

    const totalTimeLapsed = pendingTasks.reduce((acc, task) => {
      if (task.startTime && task.endTime) {
        const timeElapsed =
          (new Date(task.endTime) - new Date(task.startTime)) / 60000;
        return acc + timeElapsed;
      }
      return acc;
    }, 0);

    const totalTimeLeft = pendingTasks.reduce((acc, task) => {
      const estimatedTime = task.estimatedTime || 60; // Assuming 60 minutes as a default estimate if not available
      return acc + estimatedTime;
    }, 0);

    const pendingTaskSummary = {
      totalPendingTasks: pendingTasks.length,
      totalTimeLapsed,
      totalTimeLeft,
    };

    // Task Priority Summary
    const taskPrioritySummary = {};
    tasks.forEach((task) => {
      const priority = task.priority || 3; // Default priority if not defined (e.g., 3 is "Medium")
      if (!taskPrioritySummary[priority]) {
        taskPrioritySummary[priority] = {
          pending: 0,
          timeLapsed: 0,
          timeLeft: 0,
        };
      }
      if (task.status === "pending") {
        taskPrioritySummary[priority].pending += 1;
        if (task.startTime && task.endTime) {
          const timeElapsed =
            (new Date(task.endTime) - new Date(task.startTime)) / 60000;
          taskPrioritySummary[priority].timeLapsed += timeElapsed;
        }
        taskPrioritySummary[priority].timeLeft += task.estimatedTime || 60; // Default to 60 minutes if estimatedTime is missing
      }
    });

    // Average Time Per Task (based only on completed tasks)
    const completedTimeLapsed = tasks
      .filter((task) => task.status === "finished")
      .reduce((acc, task) => {
        if (task.startTime && task.endTime) {
          const timeElapsed =
            (new Date(task.endTime) - new Date(task.startTime)) / 60000;
          return acc + timeElapsed;
        }
        return acc;
      }, 0);

    const avgTimePerTask = completedTasks
      ? completedTimeLapsed / completedTasks
      : 0;

    // Return dashboard stats
    res.json({
      totalTasks,
      completedPercentage: tasksCompletedPercentage.toFixed(2),
      avgTimePerTask: avgTimePerTask.toFixed(2),
      pendingTaskSummary,
      taskPrioritySummary,
    });
  } catch (error) {
    console.error("Error calculating dashboard stats:", error);
    res.status(500).json({ message: "Failed to calculate stats" });
  }
};
