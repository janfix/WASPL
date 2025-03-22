<template>
  <!-- ✅ Modale Bootstrap native -->
  <div class="modal fade" id="profileModal" tabindex="-1" aria-labelledby="profileModalLabel" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="profileModalLabel">User Profile Definition</h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <form @submit.prevent="saveProfile">
            <div class="row mb-4">
          <div class="col-md-4 form-floating">
            <input v-model="userStore.user.username" type="text" class="form-control" readonly />
            <label class="fw-bold">Username</label>
          </div>

          <div class="col-md-4 form-floating">
            <input v-model="userStore.user.lastname" type="text" class="form-control" required />
            <label class="fw-bold">Last Name</label>
          </div>
          <div class="col-md-4 form-floating">
            <input v-model="userStore.user.firstname" type="text" class="form-control" required />
            <label class="fw-bold">First Name</label>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-5 form-floating">
            <input v-model="userStore.user.email" type="email" class="form-control" required />
            <label class="fw-bold">Email</label>
          </div>

          <div class="col-md-4 form-floating">
            <input v-model="userStore.user.institution" type="text" class="form-control" />
            <label class="fw-bold">Institution</label>
          </div>

          <div class="col-md-3 form-floating">
            <select v-model="userStore.user.role" class="form-select" required>
              <option value="Tester">Tester</option>
              <option value="Statisticien">Statisticien</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Director">Director</option>
              <option value="Manager">Manager</option>
              <option value="Parent">Parent</option>
              <option value="Other">Other</option>
            </select>
            <label class="fw-bold">Role</label>
          </div>
        </div>

        <!-- Langue & Notifications -->
        <div class="row mb-3">
          <div class="col-md-6 form-floating">
            <select v-model="userStore.user.language" class="form-select">
              <option value="en">English</option>
              <option value="fr">French</option>
              <option value="es">Spanish</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
            </select>
            <label class="fw-bold">Preferred Language</label>
          </div>
          <div class="col-md-6 d-flex align-items-center">
            <input v-model="userStore.user.notifications" type="checkbox" class="form-check-input me-2" />
            <label class="form-check-label fw-bold">Enable Notifications</label>
          </div>
        </div>

        <!-- Class System Encoding -->
        <div class="row mb-3">
          <!-- Class System Encoding (Pays) -->
          <div class="col-md-6 form-floating">
            <select v-model="userStore.user.classSystemEncoding" class="form-select">
              <option value="ISCED">ISCED</option>
              <option value="France">France</option>
              <option value="UK">United Kingdom</option>
              <option value="Germany">Germany</option>
              <option value="Swiss">Swiss</option>
              <option value="Spain">Spain</option>
              <option value="Italy">Italy</option>
              <option value="Belgium">Belgium</option>
              <option value="Netherlands">Netherlands</option>
              <option value="Portugal">Portugal</option>
              <option value="Austria">Austria</option>
            </select>
            <label class="fw-bold">Country Level System</label>
          </div>


          <div class="col-md-6 form-floating">
            <textarea v-model="userStore.user.subjects" class="form-control" rows="2"
              placeholder="Comma-separated values"></textarea>
            <label class="fw-bold">Subjects</label>
          </div>
        </div>

        <div class="row mb-3">
          <div class="col-md-6 form-floating">
            <textarea v-model="userStore.user.domains" class="form-control" rows="2"
              placeholder="Comma-separated values"></textarea>
            <label class="fw-bold">Domains</label>
          </div>
          <div class="col-md-6 form-floating">
            <textarea v-model="userStore.user.grades" class="form-control" rows="2"
              placeholder="Comma-separated values"></textarea>
            <label class="fw-bold">Grades</label>
          </div>
        </div>

        <!-- Report Options -->
        <div class="row mb-3">
          <div class="col-md-6 form-floating">
            <select v-model="userStore.user.reportOptions.exportFormat" class="form-select">
              <option value="PDF">PDF</option>
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
            </select>
            <label class="fw-bold">Report - Export Format</label>
          </div>
        </div>
      </form>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="closeModal">Close</button>
          <button type="button" class="btn btn-success" @click="saveProfile">Save Changes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { Modal } from "bootstrap";
import { useUserStore } from "@/stores/userStore";
import axios from "axios";
import {jwtDecode} from "jwt-decode"; // Ajouté pour décoder le token JWT

const userStore = useUserStore();
const modalInstance = ref(null);

// 🔹 Fonction pour récupérer les informations de l'utilisateur
const fetchUserData = async () => {
  try {
    // Récupérer le token depuis le localStorage
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Token non trouvé");

    // Décoder le token JWT pour récupérer l'ID utilisateur
    const decodedToken = jwtDecode(token);
    console.log("Decoded token:", decodedToken);
    const userId = decodedToken.id; 

    if (!userId) throw new Error("ID utilisateur introuvable dans le token");

    // Construire l'URL API pour récupérer l'utilisateur par son ID
    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/users/${userId}`;

    console.log("Fetching user data from:", apiUrl); // DEBUG

    // Effectuer la requête API
    const response = await axios.get(apiUrl);

    // Mise à jour des données utilisateur dans le store
    userStore.user = response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données utilisateur:", error);
  }
};


// 🔹 Fonction d'ouverture de la modale
const openModal = async () => {
  await fetchUserData(); // Récupérer les données utilisateur avant d'afficher la modale
  if (!modalInstance.value) {
    modalInstance.value = new Modal(document.getElementById("profileModal"));
  }
  modalInstance.value.show();
};

// 🔹 Fonction pour fermer la modale
const closeModal = () => {
  if (modalInstance.value) {
    modalInstance.value.hide();
  }
};

// 🔹 Fonction pour sauvegarder les changements
const saveProfile = async () => {
  console.log("🟢 Bouton Save cliqué !");
  console.log("Saving profile changes:", userStore.user);
  try {
    await userStore.updateUser(userStore.user);
    closeModal();
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
  }
};

defineExpose({ openModal });
</script>


<style scoped>
.fw-bold {
  font-weight: 700;
  margin-left: 10px;
}
</style>
