import React, { useEffect, useState } from "react";
import api from "./services/api";

const TaskList = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [newTask, setNewTask] = useState({
    title: "",
    priority: 1,
    status: "pending",
    startTime: "",
    endTime: "",
  });

  const [filters, setFilters] = useState({
    priority: "",
    status: "",
  });
  const [sortOption, setSortOption] = useState("");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await api.get("/tasks/");
        console.log(response);
        console.log(response.data.data);
        const fetchedTasks = Array.isArray(response.data.data)
          ? response.data.data
          : [];
        setTasks(fetchedTasks);
        setFilteredTasks(fetchedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error.response?.data?.message);
      }
    };
    fetchTasks();
  }, []);

  // Apply Filters and Sort
  useEffect(() => {
    let filtered = Array.isArray(tasks) ? [...tasks] : []; // Ensure tasks is an array

    // Apply filters
    if (filters.priority) {
      filtered = filtered.filter(
        (task) => task.priority === parseInt(filters.priority)
      );
    }
    if (filters.status) {
      filtered = filtered.filter((task) => task.status === filters.status);
    }

    // Apply sorting
    if (sortOption) {
      if (sortOption === "start-asc") {
        filtered.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      } else if (sortOption === "start-desc") {
        filtered.sort((a, b) => new Date(b.startTime) - new Date(a.startTime));
      } else if (sortOption === "end-asc") {
        filtered.sort((a, b) => new Date(a.endTime) - new Date(b.endTime));
      } else if (sortOption === "end-desc") {
        filtered.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
      }
    }

    setFilteredTasks(filtered);
  }, [filters, sortOption, tasks]);

  const handleSaveTask = async () => {
    try {
      if (isEditing) {
        await api.put(`/tasks/${currentTask._id}`, newTask);
      } else {
        await api.post("/tasks", newTask);
      }
      setShowModal(false);
      setNewTask({
        title: "",
        priority: 1,
        status: "pending",
        startTime: "",
        endTime: "",
      });
      setIsEditing(false);
      setCurrentTask(null);

      // Refresh task list
      const response = await api.get("/tasks");
      setTasks(response.data.data);
    } catch (error) {
      console.error(
        `Error ${isEditing ? "updating" : "creating"} task:`,
        error.response?.data?.message
      );
    }
  };

  const toggleTaskSelection = (taskId) => {
    setSelectedTaskIds((prevSelected) =>
      prevSelected.includes(taskId)
        ? prevSelected.filter((id) => id !== taskId)
        : [...prevSelected, taskId]
    );
  };

  const handleEditTask = (task) => {
    setNewTask(task);
    setCurrentTask(task);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (error) {
      console.error("Error deleting task:", error.response?.data?.message);
    }
  };

  const handleBulkDelete = async () => {
    try {
      if (selectedTaskIds.length === 0) {
        alert("No tasks selected for deletion");
        return;
      }
      await Promise.all(
        selectedTaskIds.map((taskId) => api.delete(`/tasks/${taskId}`))
      );
      setTasks((prevTasks) =>
        prevTasks.filter((task) => !selectedTaskIds.includes(task._id))
      );
      setSelectedTaskIds([]);
    } catch (error) {
      console.error("Error deleting tasks:", error.response?.data?.message);
    }
  };

  const calculateTimeToFinish = (startTime, endTime) => {
    if (!startTime || !endTime) return "-";
    const start = new Date(startTime);
    const end = new Date(endTime);
    const diffInMs = end - start; // Difference in milliseconds
    const diffInHours = diffInMs / (1000 * 60 * 60); // Convert to hours
    return diffInHours > 0 ? diffInHours.toFixed(2) + " hrs" : "-";
  };

  return (
    <>
      <div className="p-6 bg-gray-100 min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Task List</h1>
        </header>

        <div className="flex justify-between">
          <div className="mb-4 flex gap-2 items-center">
            <button
              className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-800"
              onClick={() => {
                setShowModal(true);
                setIsEditing(false);
                setNewTask({
                  title: "",
                  priority: 1,
                  status: "pending",
                  startTime: "",
                  endTime: "",
                });
              }}
            >
              + Add Task
            </button>
            <button
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              onClick={handleBulkDelete}
            >
              Delete Selected
            </button>
          </div>

          {/* Filters and Sorting */}
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                className="w-full border border-gray-300 rounded-full px-3 py-2"
                value={filters.priority}
                onChange={(e) =>
                  setFilters({ ...filters, priority: e.target.value })
                }
              >
                <option value="">All</option>
                {[1, 2, 3, 4, 5].map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
                <option
                  className="text-blue-500 mt-2 text-sm text-red-500"
                  value=""
                >
                  Remove Filter
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full border border-gray-300 rounded-full px-3 py-2"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">All</option>
                <option value="pending">Pending</option>
                <option value="finished">Finished</option>
                <option
                  className="text-blue-500 mt-2 text-sm text-red-500"
                  value=""
                >
                  Remove Filter
                </option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                className="w-full border border-gray-300 rounded-full px-3 py-2"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="">None</option>
                <option value="start-asc">Start Time: ASC</option>
                <option value="start-desc">Start Time: DESC</option>
                <option value="end-asc">End Time: ASC</option>
                <option value="end-desc">End Time: DESC</option>
                <option
                  className="text-blue-500 mt-2 text-sm text-red-500"
                  onClick={() => setSortOption("")}
                >
                  Remove Sort
                </option>
              </select>
            </div>
          </div>
        </div>
        {/* Task Table */}
        <div className="overflow-x-auto bg-white rounded shadow-md">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="py-2 px-4 border border-gray-300 text-left">
                  <input
                    type="checkbox"
                    onChange={(e) =>
                      setSelectedTaskIds(
                        e.target.checked ? tasks.map((task) => task._id) : []
                      )
                    }
                  />
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Task ID
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Title
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Priority
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Status
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Start Time
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  End Time
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Total time to finish
                </th>
                <th className="py-2 px-4 border border-gray-300 text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks?.length > 0 ? (
                filteredTasks.map((task) => (
                  <tr key={task._id} className="border-b hover:bg-gray-100">
                    <td className="py-2 px-4 border border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedTaskIds.includes(task._id)}
                        onChange={() => toggleTaskSelection(task._id)}
                      />
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {task._id}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {task.title}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {task.priority}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {task.status}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {new Date(task.startTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {new Date(task.endTime).toLocaleString()}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      {calculateTimeToFinish(task.startTime, task.endTime)}
                    </td>
                    <td className="py-2 px-4 border border-gray-300">
                      <button
                        className="text-purple-700 hover:underline"
                        onClick={() => handleEditTask(task)}
                      >
                        Edit
                      </button>
                      <button
                        className="text-red-500 hover:underline ml-4"
                        onClick={() => handleDeleteTask(task._id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    className="py-4 px-4 text-center text-gray-500"
                  >
                    No tasks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded shadow-lg p-6 w-96">
              <h2 className="text-xl font-bold mb-4">
                {isEditing ? "Update Task" : "Create Task"}
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={newTask.priority}
                  onChange={(e) =>
                    setNewTask({
                      ...newTask,
                      priority: parseInt(e.target.value),
                    })
                  }
                >
                  {[1, 2, 3, 4, 5].map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={newTask.status}
                  onChange={(e) =>
                    setNewTask({ ...newTask, status: e.target.value })
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={newTask.startTime}
                  onChange={(e) =>
                    setNewTask({ ...newTask, startTime: e.target.value })
                  }
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  className="w-full border border-gray-300 rounded px-3 py-2 mt-1"
                  value={newTask.endTime}
                  onChange={(e) =>
                    setNewTask({ ...newTask, endTime: e.target.value })
                  }
                />
              </div>
              <div className="flex justify-end">
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded mr-2 hover:bg-purple-700"
                  onClick={handleSaveTask}
                >
                  {isEditing ? "Update" : "Create"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TaskList;
