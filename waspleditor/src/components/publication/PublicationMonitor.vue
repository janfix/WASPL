<template>
  <div>
    <h2>Publication Monitor : {{ publication.publicationName }}</h2>
    <p><i>Publication ID: {{ publication._id }}</i></p>

    <div class="row timeInfo">
      <div class="col">Starting from: {{ formatDate(publication.startingDate) }}</div>
      <div class="col">End date: {{ formatDate(publication.endDate) }}</div>
      <div class="col">Days left: {{ daysLeft }}</div>
    </div>

    <hr />

    <h3>Student Session Statistics</h3>

    <!-- <div>
      <input type="text" v-model="filterValue" placeholder="Search by name..." @input="applyFilter" />
    </div> -->

    <!-- Table -->
    <div ref="tabulatorTable"></div>

  </div>
</template>

<script setup>
import { computed, ref, onMounted, nextTick } from "vue";
import axios from "axios";
import { TabulatorFull as Tabulator } from 'tabulator-tables';



const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
});

// Fonction de formatage des dates
function formatDate(dateString) {
  return dateString ? dateString.split("T")[0] : "N/A";
}

// Calcul des jours restants
const daysLeft = computed(() => {
  if (!props.publication.endDate) return "N/A";
  const today = new Date();
  const endDate = new Date(props.publication.endDate);
  const diffTime = endDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Gestion de Tabulator.js
const table = ref(null);
const tabulatorTable = ref(null);
const filterValue = ref("");

// Récupération des données des étudiants
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const fetchStudentSessions = async () => {
  try {
    const response = await axios.get(
      `${VITE_API_BASE_URL}/api/publications/${props.publication._id}/student-sessions`
    );
    return response.data; // Renvoie les données
  } catch (error) {
    console.error("❌ Error fetching student sessions:", error);
    return [];
  }
};

// Initialisation de la table
const initializeTable = async () => {
  const studentSessions = await fetchStudentSessions();

  await nextTick(); // Assure que le DOM est mis à jour avant d'initialiser Tabulator

  table.value = new Tabulator(tabulatorTable.value, {
    data: studentSessions,
    layout: "fitColumns",
    pagination: "local", // Active la pagination
    paginationSize: 10, // 10 étudiants par page
    columns: [
      { title: "Student ID", field: "studentID", sorter: "string", headerFilter: "input" },
      { title: "Last Name", field: "lastName", sorter: "string", headerFilter: "input" },
      { title: "First Name", field: "firstName", sorter: "string", headerFilter: "input" },
      { title: "Connections", field: "connectionNumber", sorter: "number" },
      { title: "Abandon", field: "abandoned", sorter: "number" },
      { title: "Accomplished", field: "accomplished", sorter: "number" },
    ],
  });
};

// Filtrage dynamique
const applyFilter = () => {
  if (table.value) {
    table.value.setFilter([
      { field: "lastName", type: "like", value: filterValue.value },
      { field: "firstName", type: "like", value: filterValue.value },
    ]);
  }
};

// Charger les données lorsque le composant est monté
onMounted(() => {
  initializeTable();
});
</script>

<style scoped>
.timeInfo {
  text-align: center;
  padding: 10px;
  border: 1px solid gainsboro;
  border-radius: 5px;
  margin-bottom: 20px;
}

input {
  margin-bottom: 10px;
  padding: 5px;
  width: 200px;
}

.session-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.session-table th, .session-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: center;
}

.session-table th {
  background-color: #f4f4f4;
  font-weight: bold;
}
</style>
