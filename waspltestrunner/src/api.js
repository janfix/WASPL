import axios from "axios";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3011/api";


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ✅ Gestion automatique du token JWT
const token = localStorage.getItem("token");

//console.log("Token récupéré :", token);

if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

api.interceptors.request.use((config) => {
 // console.log("🔹 Requête envoyée :", config.method, config.url);
 // console.log("🔹 Headers envoyés :", config.headers);
  return config;
});

export default api;
