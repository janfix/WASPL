<template>
    <div class="container">
      <p><b>You have answered {{ allAnswers.length }} questions on {{ allQuestions }} available.</b></p>
      <p>Your total score: <b>{{ totalScore }} on {{ totalMaxScore }}</b></p>
  
      <h3>Details of your answers:</h3>
  
      <div v-for="answer in allAnswers" :key="answer.questionId" class="cardReport row">
        <!-- Score affiché à gauche -->
        <div v-if="answer.score !== 'AI'" :class="getScoreClass(answer.score)" class="col-1 scoreContainer">
          {{ answer.score }}
        </div>
        <!-- Bouton AI pour les réponses non corrigées -->
        <div v-else class="col-3 scoreContainer AIProcess">
          <button type="button" class="btn btn-warning" @click="AiCorrection(answer)">
            Get AI Correction
          </button>
        </div>
  
        <!-- Contenu de la question -->
        <div class="col-9">
          <i>{{ answer.questionLabel }}</i>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    allAnswers: Array,
    testData: Object,
  });
  
  const allQuestions = computed(() =>
    props.testData.elements.filter(el => el.el_Type !== "message").length
  );
  
  const totalScore = computed(() =>
    props.allAnswers.reduce((sum, answer) => sum + parseFloat(answer.score || 0), 0)
  );
  
  const totalMaxScore = computed(() =>
    props.testData.elements.reduce((sum, el) => sum + parseFloat(el.maxScore || 0), 0)
  );
  
  const getScoreClass = (score) => {
    const numericScore = parseFloat(score);
    return numericScore > 0 ? 'bg-green' : 'bg-red';
  };
  
  // Fonction pour gérer l'appel AI (à compléter)
  const AiCorrection = (answer) => {
    console.log("Request AI Correction for", answer);
  };
  </script>
  
  <style scoped>
  .cardReport {
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid gainsboro;
    border-radius: 5px;
    display: flex;
    align-items: center;
  }
  
  .bg-red {
    background-color: tomato;
    color: white;
  }
  
  .bg-green {
    background-color: rgb(62, 193, 62);
    color: white;
  }
  
  .scoreContainer {
    text-align: center;
    padding: 10px;
    margin: -10px 0px -10px -10px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
    font-weight: bold;
  }
    
  .AIProcess {
    background-color: gainsboro;
    text-align: center;
  }
  </style>
  