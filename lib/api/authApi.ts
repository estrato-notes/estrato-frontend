import axios from "axios";

const authApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_AUTH_API_URL,
});

authApi.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default authApi;
