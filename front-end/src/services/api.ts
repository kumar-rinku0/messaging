import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 10000,
  withCredentials: true, // send cookies when cross-domain requests
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add authorization token if available
    const token = localStorage.getItem("token"); // or use a state manager like Redux
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    config.headers["Content-Type"] = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        // Token expired, redirect to login, etc.
        console.warn("Unauthorized access - possibly redirect to login");
      } else if (error.response.status === 500) {
        console.error("Server error");
      }
    } else if (error.request) {
      console.error("No response from server");
    } else {
      console.error("Request setup error", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
