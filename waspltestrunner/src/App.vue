<template>

  <router-view />
 
</template>

<script setup>
import { useAuthStore } from './stores/auth';


const authStore = useAuthStore();

// Fonction de déconnexion
const handleLogout = () => {
  authStore.logout();
  console.log('Utilisateur déconnecté');
};
</script>


<style>
nav {
  padding: 30px;
  text-align: center;
}

nav a {
  margin: 0 10px;
  color: #2c3e50;
  text-decoration: none;
}

nav a.router-link-active {
  color: #42b983;
}

.disco {
  margin-top: 20px;
  padding: 10px 20px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.disco:hover {
  background-color: #c0392b;
}
</style>
