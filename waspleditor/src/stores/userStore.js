import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import axios from 'axios';

export const useUserStore = defineStore('user', () => {
  const user = ref({
    lastName: '',
    firstName: '',
    email: '',
    notification: false,
    language: 'en',
    role: 'Tester',
    institution: '',
    classSystemEncoding: 'ISCED',
    subjects: [''],
    domains: [''],
    grades: [''],
    reportOptions: '',
  });

  const isAuthenticated = computed(() => !!user.value.email); // Vérifie si l'utilisateur est chargé

  const fetchUser = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log("🔹 Envoi de la requête à :", `${import.meta.env.VITE_API_BASE_URL}/api/user/profile`);
  
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      console.log("✅ Réponse serveur :", response.data);
      user.value = response.data;
    } catch (error) {
      console.error('❌ Failed to fetch user:', error);
      user.value = null;
    }
  };
  


  const updateUser = async (updatedUser) => {
  console.log(`${import.meta.env.VITE_API_BASE_URL}/api/users/profile`)
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/users/profile`; // Correction ici
    try {
      const token = localStorage.getItem("token");
      //console.log("🔐 Token récupéré :", token); // Vérifie si le token est bien récupéré

      if (!token) throw new Error("Token non trouvé");

  console.log("🔹 Envoi de la requête à :", apiUrl);
      const response = await axios.put(apiUrl, updatedUser, {
        headers: {
          Authorization: `Bearer ${token}`, // Ajout de l'authentification
          "Content-Type": "application/json"
        }
      });
      console.log(response.data)
  
      user.value = response.data;
      console.log("✅ Profil mis à jour avec succès !");
    } catch (error) {
      console.error("❌ Failed to update user:", error);
    }
  };
  

  const logout = () => {
    user.value = null;
    localStorage.removeItem('token');
  };

  return { user, isAuthenticated, fetchUser, updateUser, logout };
});
