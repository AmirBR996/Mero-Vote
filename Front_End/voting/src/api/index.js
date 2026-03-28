import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

api.interceptors.request.use(
  (config) => {
    const access_token = localStorage.getItem("access_token");
    if (access_token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${access_token}`;
    }
    return config;
  },
  (err) => Promise.reject(err)
);

export default api;
