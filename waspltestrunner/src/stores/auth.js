import { defineStore } from 'pinia';
import api from '@/api'; // 📌 Import de l'instance Axios configurée
import axios from "axios";

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null
  }),

  actions: {
    async login(email, password) {
      //console.log("🔍 Tentative de connexion avec :", { email, password });

      try {
        const API_BASE_URL = "http://localhost:3011/api";  // Ajout de `/api`
        const response = await axios.post(`${API_BASE_URL}/login`, { email, password });

        //console.log("✅ Réponse de l'API :", response.data);

        this.user = response.data.student; // 🔹 Correction : `student` au lieu de `user`
        this.token = response.data.token;

        //console.log(this.user);

        localStorage.setItem('token', response.data.token);
        //console.log("📌 Token stocké dans localStorage :", localStorage.getItem('token'));
        api.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`; // ✅ Utilisation de `api.js`

        // ✅ Vérifier le contenu du token
        const decodedToken = JSON.parse(atob(response.data.token.split('.')[1]));
        //console.log("🔍 Contenu du token :", decodedToken);

        return response.data; // ✅ Retourne les données pour utilisation
      } catch (error) {
        console.error("❌ Erreur dans authStore.login :", error.response?.data || error.message);
        throw error;
      }
    },

    isAuthenticated() {
      return !!this.token;
    },

    checkToken() {
  const token = localStorage.getItem("token");
  if (!token) return false;

  const payload = JSON.parse(atob(token.split(".")[1]));
  const expDate = new Date(payload.exp * 1000);
  const now = new Date();

  if (now >= expDate) {
    console.warn("⚠️ Token expiré, l'utilisateur doit se reconnecter !");
    this.logout();
    return false;
  }
  return true;
},

    logout() {
      this.user = null;
      this.token = null;
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization']; // ✅ Suppression du token dans `api.js`
    }
  }
});
