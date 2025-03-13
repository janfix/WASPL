<template>
    <TestNavBar :currentPageIndex="CPIX" :testData="testData" :answers="answers" @navigate-to-page="goToPage" />
    <div class="row">
      <div class="col-2">
        <Sidebar 
         v-if="testData && Object.keys(testData).length > 0"
          :currentPageIndex="CPIX" 
          :testData="testData" 
          :answers="answers" 
          :stop-timer="stopTimer"
          @time-up="onTimeUp" 
          @navigate-to-page="goToPage" />
      </div>
      <div class="col-10">
        <div class="container mt-5">
          <h1 v-if="testOpen && testData">{{ testData.title }}</h1>
          <p v-if="testOpen && testData">{{ testData.description }}</p>
  
          <div v-if="!testOpen">
            <p>Chargement en cours...</p>
          </div>
  
          <!-- Affichage des interactions -->
          <div v-if="testOpen" v-for="child in currentPage.children" :key="child.id">
            <component :is="getInteractionComponent(child).component" v-bind="getInteractionComponent(child).props" />
          </div>
  
          <div v-if="!testOpen" class="Endpage">
            <LastPage v-if="testData && Object.keys(testData).length > 0" :testData="testData" />
          </div>
  
          <!-- Boutons de navigation -->
          <div v-if="testOpen" class="navigation-buttons mt-4">
            <button v-if="CPIX > 0" class="btn btn-primary me-2" :disabled="!canNavigateBack" @click="prevPage">
              Previous page
            </button>
  
            <!-- Next Page -->
            <button v-if="CPIX + 1 < testData.pages.length" class="btn btn-primary"
              :disabled="CPIX + 1 === testData.pages.length || !canNavigateNext" @click="nextPage">
              Next Page
            </button>
  
            <button v-if="testData.pages.length === CPIX + 1" class="btn btn-primary sendToServer" @click="afterTest()">
              Send Results
            </button>
  
  
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  import api from "@/api"; // ✅ Import API// Importer axios pour la requête HTTP
  import { createInteraction } from '../interactions/InteractionFactory';
  import Sidebar from './Sidebar.vue';
  import TestNavBar from './TestNavBar.vue';
  import { useResponsesStore } from '../stores/useResponsesStore.js';
  import LastPage from './LastPage.vue';
  
  const responsesStore = useResponsesStore(); // Importer le store
  const route = useRoute();
  const sessionId = ref(null);
  const testId = ref(null); // Récupère l'ID du test depuis l'URL
  
  const testData = ref({}); // Initialiser testData à null pour éviter les erreurs
  const testOpen = ref(false); // Le test est fermé tant que les données ne sont pas chargées
  
  // ✅ Fonction de récupération du test
  async function fetchTestData() {
    console.log("🔍 Vérification testId :", testId.value);
   
  
    if (!testId.value) return console.error("❌ testId est undefined !");
  
    try {
      //console.log("📡 Requête envoyée à :", `${api.defaults.baseURL}/tests/${testId.value}`);
      console.log(`${testId.value}`)
      const response = await api.get(`/api/tests/${testId.value}`);
      console.log("✅ Test chargé :", response.data);
      if (response.data) {
        testData.value = response.data;
        testOpen.value = true;
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement du test :", error);
    }
  }
  
  
  const answers = computed(() => {
    console.log(responsesStore.responses)
    const result = responsesStore.responses.reduce((acc, response) => {
      acc[response.questionId] = response.answered; // Associe chaque questionId à son état answered
      return acc;
    }, {});
    console.log('Answers calculés pour TestMap :', result.value); // Vérification
    return result;
  });
  
  //const testOpen = ref(true);
  
  // Nouvelle variable pour arrêter le timer
  const stopTimer = ref(false);
  
  const token = localStorage.getItem('token'); // Récupérer le token depuis le stockage local
  let userId = null;
  
  if (token) {
    const decodedToken = decodeToken(token);
    userId = decodedToken?._id || decodedToken?.sub;
  
    if (!userId) {
      console.error('Impossible de récupérer l\'userId à partir du token décodé.');
    }
  } else {
    console.error('Token non trouvé dans le stockage local.');
  }
  
  function decodeToken(token) {
    if (!token) {
      console.error('Le token est null ou non défini');
      return null;
    }
    try {
      const payload = token.split('.')[1]; // Extraire la partie payload
      return JSON.parse(atob(payload)); // Décoder le payload (Base64)
    } catch (error) {
      console.error('Erreur lors du décodage du token :', error);
      return null;
    }
  }
  
  
  // État réactif
  const state = reactive({
    testData,
    currentPageIndex: 0, // Par défaut à la première page
  });
  
  const CPIX = ref(0)
  
  // Calculs dérivés
  const currentPage = computed(() => state.testData.pages[state.currentPageIndex]);
  const lastPageIndex = computed(() => state.testData.pages.length - 1);
  const canNavigateBack = computed(() =>
    state.testData.navigation === 'backPossible'
  );
  const canNavigateNext = computed(() => true);
  
  // ✅ Fonction de fin de test
  async function afterTest() {
    stopTimer.value = true;
    testOpen.value = false;
    sendResultsToDatabase();
  
    if (!sessionId.value) return console.error("❌ Impossible de terminer la session.");
  
    try {
      await api.post("/sessions/end", { sessionId: sessionId.value, abandoned: false });
      console.log("✅ Session clôturée :", sessionId.value);
    } catch (error) {
      console.error("❌ Erreur lors de la clôture de la session :", error);
    }
  }
  
  // Méthodes
  
  // ✅ Détection de navigation non terminée
  window.addEventListener("beforeunload", async () => {
    if (!sessionId.value) return;
    await api.post("/sessions/end", { sessionId: sessionId.value, abandoned: true });
    console.log("⚠️ Session abandonnée :", sessionId.value);
  });
  
  
  
  function prevPage() {
    if (state.currentPageIndex > 0 && canNavigateBack.value) {
      state.currentPageIndex--;
      CPIX.value--;
  
      // Charger les réponses de l'utilisateur pour la page active
      loadPageResponses(CPIX.value);
    }
  }
  
  function loadPageResponses(pageIndex) {
    const questionIDs = getPageQuestionIDs(pageIndex); // IDs des questions de la page
    console.log("Chargement des réponses pour les questions :", questionIDs);
  
    questionIDs.forEach((questionId) => {
      const response = responsesStore.getResponseForQuestion(userId, questionId);
  
      if (response) {
        // Localisez la question dans testData.elements
        const question = state.testData.elements.find((el) => el.el_ID === questionId);
  
        if (question) {
          // Mettre à jour les réponses pour les interactions correspondantes
          question.studentAnswers = response.selectedOptions || []; // Applique les réponses sauvegardées
        }
      }
    });
  }
  
  
  function getPageQuestionIDs(PageIndex) {
    // Vérifier que les données contiennent bien des pages
    if (!state.testData.pages || !Array.isArray(state.testData.pages)) {
      throw new Error("Invalid data: 'pages' array is missing or not valid.");
    }
  
    // Vérifier que l'indice de page est valide
    if (PageIndex < 0 || PageIndex >= state.testData.pages.length) {
      throw new Error("Invalid PageIndex: Index out of bounds.");
    }
  
    // Récupérer la page et les enfants
    const page = state.testData.pages[PageIndex];
  
    // Filtrer pour exclure les éléments de type "message"
    return page.children
      ?.filter((child) => {
        // Récupérer l'élément correspondant dans testData.elements
        const element = state.testData.elements.find((el) => el.el_ID === child.id);
        // Inclure uniquement si le type n'est pas "message": EVITE LE BLOCAGE SUIVANT POUR NON REPONSE
        return element?.el_Type !== "message";
      })
      .map((child) => child.id) || [];
  }
  
  
  
  function checkPageAnswers() {
    const QIDInPage = getPageQuestionIDs(CPIX.value); // Obtenir les IDs des questions de la page active
    const unansweredQuestions = QIDInPage.filter((questionId) => {
      return !responsesStore.isQuestionAnswered(questionId); // Vérifier si une question n'a pas été répondue
    });
  
    if (unansweredQuestions.length > 0) {
      console.warn(
        "Les questions suivantes n'ont pas été répondues :",
        unansweredQuestions
      );
      return false; // Certaines questions ne sont pas répondues
    }
  
    console.log("Toutes les questions de la page active ont été répondues.");
    return true; // Toutes les questions ont été répondues
  }
  
  
  function nextPage() {
  
    // Vérifier si testData.settings est bien défini avant d'accéder à skip
    if (!testData.value.settings || typeof testData.value.settings.skip === 'undefined') {
      console.error("❌ testData.settings.skip est undefined !");
      return;
    }
  
    if (!testData.value.settings.skip) {
      const allQuestionsAnswered = checkPageAnswers();
      if (!allQuestionsAnswered) {
        alert("Veuillez répondre à toutes les questions avant de passer à la page suivante.");
        return; // Bloquer la navigation
      }
    }
  
    if (state.currentPageIndex < lastPageIndex.value && canNavigateNext.value) {
      state.currentPageIndex++;
      CPIX.value++;
      console.log("Page suivante : Index actuel", CPIX.value);
    }
  }
  
  function goToPage(index) {
    console.log("NAVIGATOR TO PAGE REACH")
    if (index < 0 || index >= state.testData.pages.length) {
      console.error("Index de page invalide:", index);
      return;
    }
  
    if (!testData.value.settings.skip) {
      const allQuestionsAnswered = checkPageAnswers();
      if (!allQuestionsAnswered) {
        alert("Veuillez répondre à toutes les questions avant de changer de page.");
        return; // Bloquer la navigation si toutes les questions ne sont pas répondues
      }
    }
  
    state.currentPageIndex = index;
    CPIX.value = index;
  
    // Charger les réponses pour la nouvelle page
    loadPageResponses(index);
  
    console.log("Navigation vers la page :", index);
  }
  
  
  function getQuestion(child) {
    return state.testData.elements.find((el) => el.el_ID === child.id);
  }
  
  function getInteractionComponent(child) {
    const question = getQuestion(child);
    const interaction = createInteraction(question, state.testData); // Passe testData ici
    return interaction.render();
  }
  
  // Déstructuration pour le template
  const { currentPageIndex } = state;
  
  function onTimeUp() {
    console.log("Temps écoulé, envoi des données...");
    alert("Time's up !")
  
    // Changez testOpen à false pour passer à la dernière page
    testOpen.value = false;
  
    // Ajoutez ici votre logique pour envoyer les données à la base de données
    sendResultsToDatabase();
  }
  
  // ✅ Fonction pour envoyer les résultats
  async function sendResultsToDatabase() {
    if (!token) {
      alert("Erreur : Vous devez être connecté pour soumettre les résultats.");
      return console.error("❌ Token manquant !");
    }
  
    const resultData = {
      studentId: userId,
      testId: testId.value,
      publicationId: route.query.publicationId,
      groupId: route.query.groupId,
      responses: responsesStore.responses,
      submittedAt: new Date().toISOString(),
    };
  
    try {
      const response = await api.post("/results", resultData);
      console.log("✅ Résultats enregistrés :", response.data);
      alert("Les résultats ont été envoyés avec succès !");
    } catch (error) {
      console.error("❌ Erreur lors de l'envoi des résultats :", error);
      alert("Une erreur s'est produite lors de l'enregistrement des résultats.");
    }
  }
  
  
  
  // Charger les données dès que le composant est monté
  onMounted(async () => {
    testId.value = route.query.testId;
    console.log("🔍 testId récupéré :", testId.value);
  
    if (testId.value) {
      await fetchTestData();
    } else {
      console.error("❌ Aucun testId trouvé dans l'URL");
    }
  
    const token = localStorage.getItem("token");
  
    if (!token) {
      console.error("❌ Token manquant.");
      return;
    }
  
    // ✅ Construit la requête avec les infos nécessaires
    const requestData = {
      studentId: userId,
      testId: testId.value,
      publicationId: route.query.publicationId, // ✅ Récupéré depuis l'URL
      groupId: route.query.groupId,             // ✅ Récupéré depuis l'URL
    };
  
    console.log("🔹 Démarrage de session avec :", requestData);
  
    /* try {
      // ✅ Envoi via `api.js` pour un code plus propre
      const response = await api.post("/api/sessions/start", requestData); 
      sessionId.value = response.data.sessionId; // ✅ Stocker l'ID de session
      console.log("✅ Session enregistrée, ID :", sessionId.value);
    } catch (error) {
      console.error("❌ Erreur lors du démarrage de la session :", error);
    } */
  });
  
  
  
  </script>
  
  <style scoped>
  .InfoStatus {
    font-variant-caps: all-small-caps;
    text-align: center;
    width: 100px;
    position: fixed;
    height: 100%;
    padding: 5px;
    background-color: rgb(248, 248, 248);
  }
  
  .sendToServer {
    margin-left: 10px
  }
  
  /* Ajoutez vos styles ici */
  </style>
  