import api from "./api";

const register = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data; // Returns user + token
};

const login = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data; // Returns user + token
};

const authService = {
  register,
  login,
};

export default authService;