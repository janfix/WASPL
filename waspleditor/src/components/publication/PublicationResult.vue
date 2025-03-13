<template>
  <div>
    <h2>Résultats de la publication</h2>
    
    <button @click="launchAICorrection" :disabled="aiProcessing" class="btn btn-primary mb-3">
      {{ aiProcessing ? "Correction en cours..." : "Launch AI Correction" }}
    </button>

    <table class="table table-bordered" v-if="latestResults.length > 0">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Student ID</th>
          <th>score</th>
        </tr>
      </thead>
      <tbody v-for="(response, index) in latestResults" :key="index">
        <tr>
          <td  class="studID" v-if="index === firstOccurrenceIndex(response.userId)" >
            {{ studentNames[response.userId] || "Étudiant inconnu" }}
            <span class="badge">{{ studentAttemptCount[response.userId] }} tentatives</span>
          </td>
          <td  class="studID" v-if="index === firstOccurrenceIndex(response.userId)">
            {{ response.userId }}
          </td>
          
        </tr>
        <tr>
          <td>{{ response.questionLabel }}</td>
          <td>{{ response.selectedLabels.join(", ") || response.rawOpenAnswer || response.gapsAnswers.join(", ") }}</td>
          <td>{{ response.score }}</td>
        </tr>
      </tbody>
    </table>

    <p v-else class="no-results">Aucun résultat disponible pour cette publication.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";



const props = defineProps({
publication: {
  type: Object,
  required: true,
},
});

const results = ref([]);
const studentNames = ref({});
const aiProcessing = ref(false);

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// ✅ Récupération des résultats de la publication
const fetchResults = async () => {
try {
  const apiUrl = `${VITE_API_BASE_URL}/api/results/publication/${props.publication._id}`;
  const response = await axios.get(apiUrl);
  if (!Array.isArray(response.data)) {
    throw new Error("Les résultats ne sont pas un tableau !");
  }
  results.value = response.data;
  await fetchStudentNames();
} catch (error) {
  console.error("❌ Erreur lors de la récupération des résultats :", error);
}
};

// ✅ Récupération des noms des étudiants
const fetchStudentNames = async () => {
try {
  const studentIds = [...new Set(results.value.map((r) => r.studentId))];
  if (studentIds.length === 0) return;
  const response = await axios.post(`${VITE_API_BASE_URL}/api/students/getNames`, { studentIds });
  studentNames.value = response.data;
} catch (error) {
  console.error("❌ Erreur lors de la récupération des noms des étudiants :", error);
}
};

// ✅ Filtrer pour garder uniquement la dernière tentative de chaque étudiant
const latestResults = computed(() => {
const latestAttempts = {};
results.value.forEach((attempt) => {
  if (!latestAttempts[attempt.studentId] || new Date(attempt.submittedAt) > new Date(latestAttempts[attempt.studentId].submittedAt)) {
    latestAttempts[attempt.studentId] = attempt;
  }
});

return Object.values(latestAttempts).flatMap(studentResult => 
  studentResult.responses.map(response => ({
    userId: studentResult.studentId,
    questionLabel: response.questionLabel,
    selectedLabels: response.selectedLabels || [],
    rawOpenAnswer: response.selectedOptions || "",
    gapsAnswers: response.gapsAnswers || [],
    score: response.score
  }))
);
});

// ✅ Compter le nombre de tentatives par étudiant
const studentAttemptCount = computed(() => {
return results.value.reduce((acc, attempt) => {
  acc[attempt.studentId] = (acc[attempt.studentId] || 0) + 1;
  return acc;
}, {});
});

// ✅ Trouver la première occurrence d'un étudiant dans la liste des résultats
const firstOccurrenceIndex = (userId) => {
return latestResults.value.findIndex(r => r.userId === userId);
};

// ✅ Lancer la correction IA
const launchAICorrection = async () => {
aiProcessing.value = true;
try {
  const response = await axios.post(`${VITE_API_BASE_URL}/api/ai/correct`, {
    responses: latestResults.value.filter((r) => r.type === "shortAnswer"),
  });
} catch (error) {
  console.error("❌ Erreur lors de la correction IA :", error);
}
aiProcessing.value = false;
};

onMounted(fetchResults);
</script>

<style scoped>
.table {
width: 100%;
border-collapse: collapse;
}
.table th, .table td {
padding: 10px;
border: 1px solid #ddd;
text-align: left;
}
.no-results {
font-size: 16px;
color: #777;
text-align: center;
margin-top: 20px;
}
.badge {
background-color: #007bff;
color: white;
padding: 5px 10px;
border-radius: 12px;
font-size: 12px;
margin-left: 10px;
}

.studID{
  background-color: gainsboro!important;
}
</style>
