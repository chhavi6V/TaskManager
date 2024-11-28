import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import api from "./services/api";
import Navbar from "./components/Navbar";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    totalTasks: 0,
    completedPercentage: 0,
    avgTimePerTask: 0,
    pendingTaskSummary: {
      totalPendingTasks: 0,
      totalTimeLapsed: 0,
      totalTimeLeft: 0,
    },
    taskPrioritySummary: {},
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await api.get("/tasks/dashboard-stats");
        setDashboardData(response.data);
      } catch (error) {
        console.error(
          "Error fetching dashboard stats:",
          error.response?.data?.message || error.message
        );
      }
    };

    fetchDashboardStats();
  }, []);

  const {
    totalTasks,
    completedPercentage,
    avgTimePerTask,
    pendingTaskSummary,
    taskPrioritySummary,
  } = dashboardData;

  return (
    <>
      <div className="p-8 bg-gray-100 min-h-screen">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        </header>

        <section className="mb-8 grid grid-cols-3 gap-4">
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold text-gray-600">Total Tasks</h2>
            <p className="text-3xl font-bold text-purple-600">{totalTasks}</p>
          </div>
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold text-gray-600">Tasks Completed</h2>
            <p className="text-3xl font-bold text-purple-600">
              {completedPercentage}%
            </p>
          </div>
          <div className="bg-white shadow-md rounded p-4">
            <h2 className="text-xl font-bold text-gray-600">
              Avg Time Per Task
            </h2>
            <p className="text-3xl font-bold text-purple-600">
              {avgTimePerTask} min
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pending Task Summary
          </h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white shadow-md rounded p-4">
              <h3 className="text-xl font-bold text-gray-600">Pending Tasks</h3>
              <p className="text-3xl font-bold text-purple-600">
                {pendingTaskSummary.totalPendingTasks}
              </p>
            </div>
            <div className="bg-white shadow-md rounded p-4">
              <h3 className="text-xl font-bold text-gray-600">
                Total Time Lapsed
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {pendingTaskSummary.totalTimeLapsed.toFixed(2)} min
              </p>
            </div>
            <div className="bg-white shadow-md rounded p-4">
              <h3 className="text-xl font-bold text-gray-600">
                Estimated Time Left
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {pendingTaskSummary.totalTimeLeft.toFixed(2)} min
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Task Priority
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded shadow-md">
              <thead className="bg-purple-600 text-white">
                <tr>
                  <th className="py-2 px-4 text-left">Task Priority</th>
                  <th className="py-2 px-4 text-left">Pending Tasks</th>
                  <th className="py-2 px-4 text-left">Time Lapsed</th>
                  <th className="py-2 px-4 text-left">Time to Finish</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(taskPrioritySummary).map(([priority, data]) => (
                  <tr key={priority} className="border-b">
                    <td className="py-2 px-4">{priority}</td>
                    <td className="py-2 px-4">{data.pending}</td>
                    <td className="py-2 px-4">{data.timeLapsed.toFixed(2)}</td>
                    <td className="py-2 px-4">{data.timeLeft.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
};

export default Dashboard;
