<template>
  <div>
    <h2>Résultats de la publication</h2>

    <div v-if="hasShortAnswers" class="IATreatment">
      <h5>IA Correction Process</h5>
      <p>
        This process will correct the short answer questions using an AI model.
        It may take some time depending on the number of questions and the length of the answers.</p>
   
    <button @click="launchAICorrection" 
        :disabled="aiProcessing || !hasShortAnswers" 
        class="btn btn-primary mb-3">
  {{ aiProcessing ? "Correction en cours..." : "Launch AI Correction" }}
</button>
 </div>
    <hr>
    <button style="margin-left:10px; margin-right: 10px;" @click="handleDownloadJSON" class="btn btn-success mb-3">
      Download results (JSON)
    </button>

    <button @click="handleDownloadCSV" class="btn btn-warning mb-3">
      Download results (CSV)
</button>

    <table class="table table-bordered" v-if="latestResults.length > 0">
      <thead>
        <tr>
          <th>Student Name</th>
          <th>Student ID</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        <template v-for="(response, index) in latestResults" :key="index">
          <!-- Affichage du nom et des tentatives uniquement à la première occurrence -->
          <tr v-if="index === firstOccurrenceIndex(response.userId)">
            <td class="studID">
              {{ studentNames[response.userId] || "Étudiant inconnu" }}
              <span class="badge">{{ studentAttemptCount[response.userId] || 0 }} Attempt(s)</span>
            </td>
            <td class="studID">
              {{ response.userId }}
            </td>
          </tr>

          <!-- Affichage des réponses -->
          <tr>
            <td>{{ response.questionLabel }}</td>
            <td>{{ response.selectedLabels.join(", ") || response.rawOpenAnswer || response.gapsAnswers.join(", ") }}
            </td>
            <td>{{ response.score }}</td>
          </tr>
        </template>
      </tbody>
    </table>


    <p v-else class="no-results">Aucun résultat disponible pour cette publication.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import axios from "axios";
import { downloadJSON, downloadCSV } from "@/utils/downloadUtils";

const props = defineProps({
  publication: {
    type: Object,
    required: true,
  },
});

const results = ref([]);
const studentNames = ref({});
const aiProcessing = ref(false);
const sessionData = ref([]);
const studentAttemptCount = ref({});
const testDetails = ref(null);
const hasShortAnswers = ref(false);

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const handleDownloadJSON = () => {
  downloadJSON(props.publication, sessionData.value, studentNames.value, studentAttemptCount.value, results.value, latestResults.value);
};

const handleDownloadCSV = () => {
  downloadCSV(props.publication, studentNames.value, studentAttemptCount.value, latestResults.value);
};

// ✅ Fonction pour récupérer les détails du test
const fetchTest = async () => {
  if (!props.publication.testId.value) return;
  try {
    const apiUrl = `${VITE_API_BASE_URL}/api/tests/${props.publication.testId.value}`;
    const response = await axios.get(apiUrl);
    testDetails.value = response.data;
    hasShortAnswers.value = testDetails.value.questions.some(q => q.type === "shortAnswer");
  } catch (error) {
    console.error("❌ Erreur lors de la récupération du test :", error);
  }
};

// ✅ Fonction pour récupérer les résultats de la publication
const fetchResults = async () => {
  if (!props.publication._id) return;
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

// ✅ Fonction pour récupérer les noms des étudiants
const fetchStudentNames = async () => {
  try {
    const studentIds = [...new Set(results.value.map(r => r.studentId))];
    if (studentIds.length === 0) return;
    const response = await axios.post(`${VITE_API_BASE_URL}/api/students/getNames`, { studentIds });
    studentNames.value = response.data;
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des noms des étudiants :", error);
  }
};

// ✅ Fonction pour récupérer les sessions des étudiants
const fetchStudentSessions = async () => {
  if (!props.publication._id) return [];
  try {
    const response = await axios.get(
      `${VITE_API_BASE_URL}/api/publications/${props.publication._id}/student-sessions`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Error fetching student sessions:", error);
    return [];
  }
};

// ✅ Fonction pour logguer les sessions des étudiants
const fetchAndLogStudentSessions = async () => {
  sessionData.value = await fetchStudentSessions();
  studentAttemptCount.value = sessionData.value.reduce((acc, session) => {
    acc[session.studentID] = session.connectionNumber;
    return acc;
  }, {});
  console.log("Tentatives par étudiant :", studentAttemptCount.value);
};

// ✅ Calcul des derniers résultats de chaque étudiant
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

// ✅ Trouver la première occurrence d'un étudiant dans les résultats
const firstOccurrenceIndex = (userId) => {
  return latestResults.value.findIndex(r => r.userId === userId);
};






// ✅ Surveiller les changements de publication et recharger les résultats
watch(
  () => props.publication,
  async () => {
    console.log("🔄 Mise à jour de PublicationResult avec une nouvelle publication !");
    await fetchResults(); // Récupère les résultats des tests
    await fetchAndLogStudentSessions(); // Récupère les tentatives des étudiants
    await fetchTest(); // Récupère les détails du test
  },
  { deep: true, immediate: true }
);

// ✅ Charger les résultats au montage
onMounted(async () => {
  await fetchResults();
  await fetchAndLogStudentSessions();
  await fetchTest();
});
</script>


<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
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

.studID {
  background-color: gainsboro !important;
}
</style>
