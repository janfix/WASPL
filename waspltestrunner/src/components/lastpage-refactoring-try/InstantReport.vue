<template>
    <div class="InstantReport">
      <h2>Instant report</h2>
      <p>The open-ended questions are corrected by an AI. Please wait during the local treatment of your answers.</p>
  
      <ScoreSummary :allAnswers="allAnswers" :testData="testData" />
  
      <div v-for="answer in allAnswers" :key="answer.questionId" class="cardReport row">
        <!-- Score affiché à gauche -->
        <div v-if="answer.score !== 'AI'" :class="getScoreClass(answer.score)" class="col-1 scoreContainer">
          {{ answer.score }}
        </div>
  
        <!-- Bouton AI pour lancer la correction -->
        <div v-else class="col-3 scoreContainer AIProcess">
          <button type="button" class="btn btn-warning" @click="AiCorrection(answer)">
            Get AI Correction
          </button>
        </div>
  
        <!-- Affichage des résultats AI -->
        <AIResults v-if="answer.score === 'AI' && aiResults[answer.questionId]" 
                   :answer="answer"
                   :correction="aiResults[answer.questionId]" />
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import ScoreSummary from './ScoreSummary.vue';
  import AIResults from './AIResults.vue';
  
  const props = defineProps({
    testData: Object,
    allAnswers: Array,
  });
  
  const aiResults = ref({}); // Stocke les résultats de l'AI pour chaque question
  
  const getScoreClass = (score) => {
    return parseFloat(score) > 0 ? 'bg-green' : 'bg-red';
  };
  
  // Fonction pour envoyer la requête AI et stocker les résultats
  const AiCorrection = async (answer) => {
    console.log("Requesting AI Correction for", answer);
  
    const questionText = answer.questionLabel;
    const correctionPrompt = `
      You are a ${props.testData.Subject} teacher in ${props.testData.level}.
      Here is the question: ${questionText}
      Here is the student's answer: ${answer.selectedOptions}
      Can you evaluate this answer? Provide a score out of 10 and feedback.
      Format your response as JSON: { "answer": true/false, "score": 0-10, "comment": "your feedback" }
    `;
  
    try {
      const response = await fetch("http://127.0.0.1:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ prompt: correctionPrompt.trim() })
      });
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  
      const data = await response.json();
      console.log("AI Response:", data);
  
      const parsedResponse = JSON.parse(data.response);
      
      // Stocker la correction AI pour cette question
      aiResults.value[answer.questionId] = {
        axis: "General",
        response: parsedResponse,
        score: parsedResponse.score
      };
      
    } catch (error) {
      console.error("AI Correction Error:", error);
    }
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
    padding: 5px;
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
  