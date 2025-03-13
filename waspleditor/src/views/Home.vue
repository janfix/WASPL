<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import MainTabSystem from '../components/MainTabSystem.vue';
import NavBar from '../components/NavBar.vue';

const router = useRouter()

const logout = () => {
  localStorage.removeItem('token')
  router.push('/login')
}
</script>



<template>
  <div class="app-wrapper d-flex flex-column min-vh-100">
    <NavBar />
    <main class="flex-grow-1 py-4">
      <div class="mainContainer">
        <h1>Welcome to the WASPL Assessment Manager</h1>
        <!-- <button @click="logout" class="btn btn-danger">
          Se déconnecter
        </button> -->
        <MainTabSystem />
      </div>
    </main>

    <footer class="bg-dark text-white py-3 mt-auto">
      <div class="container text-center">
        <p class="mb-0">Wiquid Copyright © 2025</p>
      </div>
    </footer>
  </div>
</template>

<style>
.tabulator{
  background-color: transparent!important;
}

.card-preview{
  background-color: rgb(243, 243, 243);
}

</style>