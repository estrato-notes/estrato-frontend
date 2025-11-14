import axios from "axios";

export const authApi = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/auth`,
})

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
