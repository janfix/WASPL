<template>
  <div class="container">
    <header class="d-flex flex-wrap justify-content-center py-3 mb-4 border-bottom">
      <a
        href="/publications"
        class="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-body-emphasis text-decoration-none"
      >
        <img src="../assets/waspl.png" width="50px" />
        <span class="fs-4 ml-2">WASPL Task List</span>
      </a>
    </header>
  </div>

  <div class="container">
    <!-- Message de bienvenue -->
    <h2>Welcome, {{ studentName }}!</h2>
    <p class="text-muted">Here are your available tasks:</p>

    <!-- Liste des publications -->
    <ul class="list-group">
      <li
        v-for="publication in publications"
        :key="publication._id"
        class="list-group-item d-flex justify-content-between align-items-center"
      >
        <div>
          <strong>{{ publication.publicationName }}</strong>
          <br />
          <small>Available from: {{ formatDate(publication.startingDate) }}</small>
          <br />
          <small>Until: {{ formatDate(publication.endDate) }}</small>
        </div>
        <button
          class="btn btn-primary btn-sm"
          :disabled="!isOpen(publication)"
          @click="goToTest(publication)"
        >
          Start Now
        </button>
      </li>
    </ul>

    <!-- Message si aucune publication n'est disponible -->
    <div v-if="publications.length === 0" class="alert alert-info mt-3">
      No publications available at the moment.
    </div>
  </div>

  <div class="container m-4" style="text-align: right;">
    <hr>
    <button class="btn btn-danger" @click="handleLogout">Disconnect</button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import {jwtDecode} from 'jwt-decode';



const router = useRouter();
const studentName = ref("Student"); // Nom par défaut si non trouvé
const publications = ref([]);

// Fonction pour récupérer les publications
const fetchPublications = async () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Aucun token trouvé.");
      return;
    }

    const response = await axios.get("http://localhost:4000/api/publications", {
      headers: { Authorization: `Bearer ${token}` },
    });

    console.log("Publications reçues :", response.data);
    publications.value = response.data; // Affecter les données aux publications
  } catch (error) {
    console.error("Erreur lors de la récupération des publications :", error);
  }
};

// Fonction pour récupérer le nom de l'étudiant depuis le token
const fetchStudentName = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    // Décoder le token pour extraire les informations utilisateur
    const decoded = jwtDecode(token);
    studentName.value = `${decoded.firstname} ${decoded.lastname}`;
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    studentName.value = "Student";
  }
};

// Fonction pour gérer la déconnexion
const handleLogout = () => {
  localStorage.removeItem("token");
  router.push("/login");
};

// Vérifie si une publication est ouverte
const isOpen = (publication) => {
  const now = new Date();
  const startDate = new Date(publication.startingDate);
  const endDate = new Date(publication.endDate);
  return now >= startDate && now <= endDate;
};

// Redirige vers le TestRunner pour un test spécifique
const goToTest = (publication) => {
  console.log("BOOM")
  const testId = publication.testId?._id || publication.testId; // Extraction de l'ID correct
  const publicationId = publication._id; // ID de la publication
  const groupId = publication.groupId?._id || publication.groupId; // Extraction de l'ID correct

  console.log("🔍 Navigation vers le test avec :", { testId, publicationId, groupId });

  if (!testId || !publicationId || !groupId) {
    console.error("❌ Erreur : Informations manquantes", { testId, publicationId, groupId });
    return;
  }

  const route = `/test-runner?testId=${testId}&publicationId=${publicationId}&groupId=${groupId}`;
  console.log("🚀 Redirection vers :", route);

  router.push(route);
};


// Formatte une date au format lisible
const formatDate = (date) => {
  if (!date) return "Invalid Date";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Actions au montage du composant
onMounted(() => {
  fetchStudentName(); // Décoder le token pour récupérer les infos utilisateur
  fetchPublications(); // Récupérer les publications
});
</script>

<style scoped>
.ml-2 {
  margin-left: 10px;
}
</style>
