import axios from "axios";

// ✅ Create Axios Instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8081",
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Request Interceptor (Attach Token)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response Interceptor (Handle Errors Globally)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // 🔐 If token expired / unauthorized (only redirect if not on login page)
    if (error.response?.status === 401 && !window.location.pathname.includes("/login") && window.location.pathname !== "/") {
      localStorage.clear();
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

// =====================
// 🔹 AUTH APIs
// =====================
export const loginUser = (data) => api.post("/auth/login", data);
export const registerUser = (data) => api.post("/auth/register", data);

// =====================
// 🔹 LEAD APIs
// =====================
export const getLeads = () => api.get("/leads");
export const getLeadById = (id) => api.get(`/leads/${id}`);
export const createLead = (data) => api.post("/leads", data);
export const updateLead = (id, data) => api.put(`/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/leads/${id}`);

// =====================
// 🔹 ASSIGNMENT API
// =====================
export const assignLead = (leadId, userId) =>
  api.put(`/leads/${leadId}/assign/${userId}`);

export default api;