import axios from "axios";

// Detecta se está em produção ou desenvolvimento
const isProduction = import.meta.env.PROD;

// Em produção, usa a mesma URL do frontend
// Em desenvolvimento no celular, usa o IP do PC
const baseURL = isProduction
  ? "/api"
  : `${window.location.protocol}//${window.location.hostname}:3001/api`;

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;