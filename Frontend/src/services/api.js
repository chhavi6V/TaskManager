import axios from "axios";

const api = axios.create({
  baseURL: "https://task-manager-tau-teal.vercel.app/api",
});

api.interceptors.request.use(
  (request) => {
    const token = localStorage.getItem("token");
    if (token) {
      request.headers.Authorization = `Bearer ${token}`;
    }
    return request;
  },
  (error) => {
    console.error("Request error:", error.message);
    return Promise.reject(error);
  }
);

export default api;
