import axios from "axios";

export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem("eventhub_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
