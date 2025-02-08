import axios from "axios";
import { getToken } from "./token";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/",
  headers: {
    "Content-Type": "application/hal+json",
  },
});

// Add a request interceptor to set the Authorization header
api.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token.token) {
      config.headers.Authorization = `Bearer ${token.token}`;
    }
    return config;
  },
  (error) => {
    console.error("rejecting request, there is no access token");
    return Promise.reject(error);
  }
);

export default api;
