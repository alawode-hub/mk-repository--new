import axios from "axios";
const API = axios.create({
  baseURL: "http://localhost:4000/api",
});

// Auto-attach token to every request
API.interceptors.request.use((config) => {
  console.log("INTERCEPTOR HIT:", config.url);
  const raw = localStorage.getItem("user");
  console.log("RAW user:", raw);
  
  const userInfo = raw ? JSON.parse(raw) : null;
  console.log("TOKEN:", userInfo?.token);
  
  if (userInfo?.token) {
    config.headers.Authorization = `Bearer ${userInfo.token}`;
  }
  
  return config;
});

export default API;