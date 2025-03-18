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
    <button style="margin-left:10px; margin-right: 10px;" @click="downloadJSON" class="btn btn-success mb-3">
      Télécharger les résultats (JSON)
    </button>

    <button @click="downloadCSV" class="btn btn-warning mb-3">
  Télécharger les résultats (CSV)
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
const sessionData = ref([]);
const studentAttemptCount = ref({});



const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// ✅ Récupération des résultats de la publication


const testDetails = ref(null);
const hasShortAnswers = ref(false);

const fetchTest = async () => {
  try {
    const apiUrl = `${VITE_API_BASE_URL}/api/tests/${props.publication.testId}`;
    const response = await axios.get(apiUrl);
    testDetails.value = response.data;

    // Vérifier si le test contient des questions de type 'shortAnswer'
    hasShortAnswers.value = testDetails.value.questions.some(q => q.type === "shortAnswer");

  } catch (error) {
    console.error("❌ Erreur lors de la récupération du test :", error);
  }
};

const shortAnswerResponses = computed(() => {
  return latestResults.value.filter(response => response.type === "shortAnswer");
});


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

// Récupération des données des étudiants
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



const fetchAndLogStudentSessions = async () => {
  sessionData.value = await fetchStudentSessions();

  // Construire l'objet associant `studentID` à `connectionNumber`
  studentAttemptCount.value = sessionData.value.reduce((acc, session) => {
    acc[session.studentID] = session.connectionNumber;
    return acc;
  }, {});

  console.log("Tentatives par étudiant :", studentAttemptCount.value);
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

// ✅ Trouver la première occurrence d'un étudiant dans la liste des résultats
const firstOccurrenceIndex = (userId) => {
  return latestResults.value.findIndex(r => r.userId === userId);
};

// ✅ Lancer la correction IA
const launchAICorrection = async () => {
  if (!hasShortAnswers.value) {
    alert("Aucune question à réponse ouverte trouvée dans ce test.");
    return;
  }

  aiProcessing.value = true;

  try {
    const response = await axios.post(`${VITE_API_BASE_URL}/api/ai/correct`, {
      responses: shortAnswerResponses.value
    });

    console.log("✅ Correction IA terminée :", response.data);
    alert("Correction IA terminée avec succès !");

  } catch (error) {
    console.error("❌ Erreur lors de la correction IA :", error);
    alert("Erreur lors de la correction IA.");
  }

  aiProcessing.value = false;
};



const downloadJSON = () => {
  // Construire l'objet avec toutes les données
  const dataToDownload = {
    publicationId: props.publication._id,
    students: sessionData.value.map(student => ({
      studentID: student.studentID,
      name: studentNames.value[student.studentID] || "Étudiant inconnu",
      attempts: studentAttemptCount.value[student.studentID] || 0,
    })),
    results: results.value,
    latestResults: latestResults.value
  };

  // Convertir en JSON
  const jsonData = JSON.stringify(dataToDownload, null, 2);

  // Créer un blob et un lien de téléchargement
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  // Créer un élément <a> pour télécharger le fichier
  const a = document.createElement("a");
  a.href = url;
  a.download = `publication_${props.publication._id}_results.json`;
  document.body.appendChild(a);
  a.click();

  // Nettoyer l'URL après le téléchargement
  URL.revokeObjectURL(url);
};


const downloadCSV = () => {
  // Construire les en-têtes du CSV
  const headers = ["Student ID", "Student Name", "Attempts", "Question Label", "Selected Answers", "Score"];

  // Construire les lignes des résultats
  const rows = latestResults.value.map(response => {
    const studentName = studentNames.value[response.userId] || "Étudiant inconnu";
    const attempts = studentAttemptCount.value[response.userId] || 0;
    const selectedAnswers = response.selectedLabels.join(", ") || response.rawOpenAnswer || response.gapsAnswers.join(", ");
    
    return [
      response.userId,
      studentName,
      attempts,
      response.questionLabel,
      selectedAnswers,
      response.score
    ];
  });

  // Générer le contenu CSV
  let csvContent = "data:text/csv;charset=utf-8," + 
    headers.join(";") + "\n" + // En-têtes
    rows.map(row => row.join(";")).join("\n"); // Lignes

  // Encoder en URI
  const encodedUri = encodeURI(csvContent);

  // Créer un élément de téléchargement
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `publication_${props.publication._id}_results.csv`);
  document.body.appendChild(link);
  link.click();

  // Nettoyage
  document.body.removeChild(link);
};


onMounted(async () => {
  await fetchResults(); // Récupère les résultats des tests
  await fetchAndLogStudentSessions(); // Récupère les tentatives des étudiants
  await fetchTest(); // Récupère les détails du test
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
