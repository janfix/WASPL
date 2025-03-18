<template>
  <div class="preview-section">
    <hr>
    <div v-if="selectedElement" class="card">
      <!-- Utilisation du composant PreviewHeader -->
      <cardHeader 
      :numOrder="getQuestionNumber()"
      :elementType="selectedElement.el_Type" 
      :mode="'Preview'" 
      />

      <div class="card-body">
        <div class="mb-2">
          <h3>{{ selectedElement.el_Text }}</h3>
        </div>
        <div class="quill-editor" ref="quillEditor"></div>

        <div class="AllFeedbacks" v-if="showReport">
          <div v-if="results.score === selectedElement.maxScore && selectedElement.feedback.correct"
            class="PositiveFeebackContainer">
            {{ selectedElement.feedback.correct }}
          </div>
          <div v-else-if="results.score < selectedElement.maxScore && selectedElement.feedback.incorrect"
            class="NegativeFeebackContainer">
            {{ selectedElement.feedback.incorrect }}
          </div>
        </div>

        <div class="mt-4">
          <draggable v-model="shuffledLabels" tag="ol" group="labels" @end="onDragEnd" itemKey="id">
            <template #item="{ element, index }">
              <li :key="element.id" class="label-item">
                <input 
                  disabled type="text" 
                  v-model="shuffledLabels[index].text" 
                  class="form-control" />
              </li>
            </template>
          </draggable>
        </div>

        <div class="ReportContainer" v-if="showReport">
          <div class="row">
            <div class="col">
              <h5>Results:</h5>
            </div>
            <div class="col" style="text-align: right;">
              <strong>Date:</strong> {{ currentDate }}
            </div>

            <hr>
            <p><strong>Your Answers:</strong> {{ results.content }}</p>
            <p><strong>Max-Score:</strong> {{ selectedElement.maxScore }} </p>
            <p><strong>Score:</strong> {{ results.score }}</p>
            
          </div>
        </div>
      </div>

      <cardFooterLearningMode
        :showReport="showReport"
        :submitAnswers="submitAnswers"
        :closeReport="closeReport"
        :resetSelections="resetLabels"
      />
    </div>
  </div>
</template>

<script setup>
import { useResponsesStore } from '../../stores/useResponsesStore.js';
import cardHeader from './cardHeader.vue';
import { ref, computed, onMounted } from 'vue';
import draggable from 'vuedraggable';
import Quill from 'quill';
import cardFooterLearningMode from './cardFooterLearningMode.vue';

const props = defineProps({
  question: {
    type: Object,
    required: true,
  },
  testData: {
    type: Object,
    required: true,
  },
  questionIndexMap: Array // 🔥 Ajout de la table des numéros
});

const selectedElement = computed(() => props.question);
const responsesStore = useResponsesStore();
const shuffledLabels = ref([]);
const quillEditor = ref(null);
let quillInstance = null;
const showReport = ref(false);
const token = localStorage.getItem('token'); // Récupérer le token depuis le stockage local
const decodedToken = decodeToken(token);
const userId = decodedToken?._id || decodedToken?.sub;


// Récupère le numéro de la question depuis questionIndexMap
const getQuestionNumber = () => {
  if (!props.questionIndexMap || !Array.isArray(props.questionIndexMap)) {
    console.error("❌ questionIndexMap est indéfini ou n'est pas un tableau.");
    return "N/A";
  }

  const match = props.questionIndexMap.find(q => q.id === props.question.el_ID);
  return match ? match.number : "N/A"; 
};


const results = ref({
  score: 0,
  error: 0,
  content: '',
});

const currentDate = computed(() => {
  const now = new Date();
  return now.toLocaleString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
});

// Mélanger les étiquettes
const shuffleArray = (array) => {
  return array
    .map((item) => ({ id: Math.random().toString(36).substr(2, 9), text: item }))
    .sort(() => Math.random() - 0.5);
};

const initializeLabels = () => {
  if (selectedElement.value?.labels) {
    shuffledLabels.value = shuffleArray(selectedElement.value.labels);
  }
};

// Charger les réponses sauvegardées ou initialiser
onMounted(() => {
  const savedResponse = responsesStore.getResponseForQuestion(userId, selectedElement.value.el_ID);

  if (savedResponse && savedResponse.labelsOrder) {
    // Charger les étiquettes dans l'ordre enregistré
    shuffledLabels.value = savedResponse.labelsOrder.map((label) => ({ text: label }));
  } else {
    // Sinon, initialiser avec un ordre aléatoire
    initializeLabels();
  }

  if (quillEditor.value) {
    quillInstance = new Quill(quillEditor.value, {
      theme: 'snow',
      readOnly: true,
      modules: { toolbar: false },
    });

    if (selectedElement.value?.el_RichText) {
      quillInstance.root.innerHTML = selectedElement.value.el_RichText;
    }
  }
});

// Calculer le score et sauvegarder
const submitAnswers = () => {
  const correctOrder = selectedElement.value.labels;
  const studentOrder = shuffledLabels.value.map(label => label.text); // Liste complète

  results.value.content = [...studentOrder]; // Sauvegarde complète de l'ordre actuel

  results.value.score = studentOrder.every((label, index) => label === correctOrder[index])
    ? selectedElement.value.weight
    : 0;
  
  results.value.score = results.value.score > 0 ? 1 : 0;
  results.value.error = results.value.score === 0 ? 1 : 0;

  const response = {
    userId: userId,
    questionId: selectedElement.value.el_ID,
    questionLabel: selectedElement.value.el_Text,
    type: selectedElement.value.el_Type,
    labelsOrder: [...studentOrder], // Liste complète garantie
    timestamp: new Date().toISOString(),
    answered: true,
    score: results.value.score || 0,
    maxScore: selectedElement.value.maxScore
  };

  responsesStore.saveResponse(response);
  showReport.value = true;
};


const resetLabels = () => {
  initializeLabels(); // Réinitialiser à un ordre aléatoire
  showReport.value = false;

  const response = {
    userId: userId,
    questionId: selectedElement.value.el_ID,
    labelsOrder: [],
    timestamp: new Date().toISOString(),
    answered: false,
  };

  responsesStore.saveResponse(response);
};

const closeReport = () => {
  showReport.value = false;
};

const onDragEnd = () => {
  const studentOrder = shuffledLabels.value.map(label => label.text);

  const response = {
    userId: userId,
    questionLabel: selectedElement.value.el_Text,
    questionId: selectedElement.value.el_ID,
    type: selectedElement.value.el_Type,
    labelsOrder: [...studentOrder], // Toujours inclure l'ensemble des positions
    score: results.value.score || 0,
    timestamp: new Date().toISOString(),
    answered: true,
  };

  responsesStore.saveResponse(response);
  console.log('Updated labels after drag-and-drop:', studentOrder);
};



function decodeToken(token) {
  if (!token) {
    return null;
  }
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
</script>

<style scoped>
.label-item {
  padding: 5px;
 
  border: 1px solid #ccc;
  margin-bottom: 5px;
  background-color: #f9f9f9;
  cursor: move;
}

.PositiveFeebackContainer {
  background-color: rgb(222, 246, 224);
  margin: 10px;
  padding: 10px;
  border: 1px green dotted;
  border-radius: 5px;
}

.NegativeFeebackContainer {
  background-color: rgb(246, 234, 235);
  margin: 10px;
  padding: 10px;
  border: 1px rgb(253, 97, 206) dotted;
  border-radius: 5px;
}

.ReportContainer {
  border: grey 1px solid;
  border-radius: 3px;
  padding: 20px;
  background-color: rgb(54, 63, 67);
  color: greenyellow;
}
</style>
