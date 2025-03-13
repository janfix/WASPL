<template>
    <div class="default">
        <h1>The test is now over.</h1>
        <p>Your answers have been sent! Thank you for your participation.</p>
    </div>
    <hr>
    <div v-if="testData.settings && testData.settings.directScore_FB" class="InstantReport">
        <h2>Instant report</h2>
        <p>The open ended question are corrected by an AI.
            Please wait during the local treatment of your aswers.</p>



        <div class="container">
            Here is your answers' summary and your score.
            <br>
            <div class="MainResultContainer">
            <p><b>You have answered {{ allAnswers.length }} questions on {{ allQuestions }} available.</b>
                <br>
                Your total score: <b>{{ totalScore }} on {{ totalMaxScore }}</b>
            </p>
            <p class="message">Please launch AI corrections to finalize your score !</p>
            </div>
            <div v-for="answer in allAnswers" class="cardReport row">
                <div v-if="answer.score !== 'AI'" :class="getScoreClass(answer.score)" class="col-1 scoreContainer">
                    {{ answer.score }}
                </div>
                <div v-else :class="'AIProcess'" class="col-1">
                    <div v-if="!showCorrection">
                        <button type="button" class="GetAIBT" @click="AiCorrection(answer)">
                            Get AI Correction
                        </button>
                    </div>

                    <div v-else class="totalQScore" :class="getTotalQScoreClass">
                        {{ totalQScore }}
                    </div>
                </div>
                <div class="col-9">
                    <div v-if="answer.score !== 'AI'">
                        <i>{{ answer.questionLabel }}</i> <br>

                    </div>
                    <div v-else>
                        <i>{{ answer.questionLabel }}</i>
                        <div v-if="isLoading">
                            <img src="../assets/loading.gif" alt="Loading..." class="loading-gif" />
                            <p>Processing your answer, please wait...</p>
                        </div>
                        <div v-else>
                            <div v-if="results.correction.length > 0">
                                <div class="accordion" id="accordionAITreatment">
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="headingOne">
                                            <button class="accordion-button" type="button" data-bs-toggle="collapse"
                                                data-bs-target="#collapseOne" aria-expanded="true"
                                                aria-controls="collapseOne">
                                                <h5>AI Correction details :</h5>
                                            </button>
                                        </h2>
                                        <div id="collapseOne" class="accordion-collapse collapse"
                                            aria-labelledby="headingOne" data-bs-parent="#accordionAITreatment">
                                            <div class="accordion-body">
                                                <div v-for="(correction, index) in results.correction" :key="index"
                                                    class="card mb-3">
                                                    <div class="card-body">
                                                        <h6 class="card-title"><strong>Axis:</strong> {{ correction.axis
                                                            }}</h6>
                                                        <strong>Answer:</strong> {{ correction.response.answer }}
                                                        <p><strong>Response:</strong> {{ correction.response.comment }}
                                                        </p>
                                                        <!-- <p><strong>Score AI:</strong> {{ correction.response.score }} / 10</p> -->
                                                        <p>{{ correction.axis }}</p>
                                                        <p>{{ correction.response.answer }}</p>
                                                        <p><strong>Score axis {{ index }}:</strong>
                                                            {{ correction.score }}</p>
                                                    </div>
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                    <div class="accordion-item">
                                        <h2 class="accordion-header" id="headingTwo">
                                            <button class="accordion-button collapsed" type="button"
                                                data-bs-toggle="collapse" data-bs-target="#collapseTwo"
                                                aria-expanded="false" aria-controls="collapseTwo">
                                                <h5>AI parameters :</h5>
                                            </button>
                                        </h2>
                                        <div id="collapseTwo" class="accordion-collapse collapse"
                                            aria-labelledby="headingTwo" data-bs-parent="#accordionAITreatment">
                                            <div class="accordion-body" style="background-color: black;">
                                                <div style="color:orange;">
                                                    <h5>Final Prompt</h5>
                                                    <p>{{ correctionPrompt }}</p>
                                                    <h5>AI Model: {{ results.AImodel }}</h5>
                                                    <p>AI response duration: ..</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <hr>
    <div class="AIfeedback">
        <p>This component uses a local AI to generate:</p>
        <h3>AI comment</h3>
        <ul>
            <li>It is a comment on the performance:</li>
            <li>Constructive criticism</li>
        </ul>
        <h3>AI advice and greetings</h3>
        Here are some tips to do better.
        <li>Cheers</li>
        <li>Congratulations</li>
    </div>
</template>

<script setup>
import { useResponsesStore } from '../stores/useResponsesStore.js';
import { ref, watch, computed, nextTick } from 'vue';

const correctionPrompt = ref("")
const showCorrection = ref(false);
const responsesStore = useResponsesStore();
const allAnswers = responsesStore.$state.responses;
const allQuestions = ref(0);
const totalScore = ref(0);
const totalMaxScore = ref(0);
const AIready = ref(false)
const props = defineProps({
    testData: {
        type: Object,
        required: true,
    },
});
const toto = "toto";
const token = localStorage.getItem('token'); // Récupérer le token depuis le stockage local
const decodedToken = decodeToken(token);
const userId = decodedToken?._id || decodedToken?.sub;

const results = ref({
    userId: userId,
    content: "todo",
    timestamp: new Date().toISOString(),
    score: 0,
    error: 0,
    correction: []
});

const partialScore = ref([]);

const totalQScore = computed(() => {
    return partialScore.value.reduce((sum, score) => sum + (Number(score) || 0), 0);
});

const getTotalQScoreClass = computed(() => {
    if (totalQScore.value > 0) return "bg-green scoreContainerLarge";
    if (totalQScore.value < 0) return "bg-red scoreContainerLarge";
    return ""; // Pas de classe si le score est neutre
});

//Identify Openended Question
function AiCorrection(answ) {
    if (!answ) return;
    showCorrection.value = true;
    const elemData = getElement(answ.questionId)
    SequenceAxesTreatment(elemData, answ)
    partialScore.value = [];

    // Mise à jour du score total après correction IA
    nextTick(() => {
        totalScore.value += totalQScore.value;
        console.log(`totalScore mis à jour : ${totalScore.value}`);
    });
}

function getElement(el_id) {
    if (!props.testData || !props.testData.elements) {
        console.error("Les données ne sont pas disponibles !");
        return null;
    }

    return props.testData.elements.find(element => element.el_ID === el_id) || null;
}

// Fonction pour compter les questions
function QuestionCounter() {
    let Qcounter = 0;
    for (let i = 0; i < props.testData.elements.length; i++) {
        if (props.testData.elements[i].el_Type !== "message") {
            Qcounter++;
        }
    }
    return Qcounter;
}

// Assignez le résultat à allQuestions
allQuestions.value = QuestionCounter();

// Fonction pour vérifier la validité d'un score
const isValidScore = (score) => {
    const numericScore = parseFloat(score);
    if (isNaN(numericScore) || score === null || score === undefined || score === "") {
        console.warn(`Score invalide exclu : ${score}`);
        return false;
    }
    return true;
};

// Calcul du score total en excluant les valeurs non exploitables
const calculateTotalScore = () => {
    totalScore.value = allAnswers
        .filter(answer => isValidScore(answer.score))
        .reduce((sum, answer) => sum + parseFloat(answer.score), 0);
};

// Calcul du score max total
const calculateTotalMaxScore = () => {
    totalMaxScore.value = props.testData.elements
        .filter(el => isValidScore(el.maxScore))
        .reduce((sum, el) => sum + parseFloat(el.maxScore), 0);
};

// Calcul initial et mise à jour automatique
calculateTotalScore();
calculateTotalMaxScore();

watch(allAnswers, () => {
    setTimeout(() => {
        calculateTotalScore();
    }, 10);  // ✅ Petit délai pour éviter un effet domino
}, { deep: true });

watch(() => props.testData.elements, () => {
    calculateTotalMaxScore();
}, { deep: true });

watch(totalQScore, (newScore, oldScore) => {
    console.log(`Mise à jour du totalScore: ancien score = ${oldScore}, nouveau score = ${newScore}`);
    totalScore.value += newScore - oldScore;
});

const getScoreClass = (score) => {
    const numericScore = parseFloat(score);
    return numericScore > 0 ? 'bg-green' : 'bg-red';
};


/* this function will prepare and send an AI request Prompt for each different correction axis*/
const SequenceAxesTreatment = (Elementdata, answer) => {

    const axes = Elementdata.correctionAxes;

    results.value.correction.length = 0;

    for (let i = 0; i < axes.length; i++) {

        correctionPrompt.value =
            `you are a ${props.testData.Subject} teacher in ${props.testData.level}, 
            here is the question asked to the students: 
            ${answer.questionLabel}
            Here is the student\'s answer: 
            ${answer.selectedOptions.trim()}
            Can you say if ${axes[i].axis} ? 
            Format your answer in the strict form of a JSON and assign a score out of 10 that strictly concerns this aspect of the question. 
            Here is the structure of the JSON to respect { "answer": false/true, "score": 0-10, "comment": "here is your comment" }. 
            Be careful, no information should accompany the JSON!`;

        // Appeler Ollama pour traiter la réponse
        askLMStudio(correctionPrompt.value.trim(), axes[i].axis, Elementdata.el_ID);

    }
}

const isLoading = ref(false); // État pour afficher/masquer le GIF

const askLMStudio  = (Question, currentAxis, elID, attempt = 1, maxRetries = 3) => {  //Ask ask askLMStudio
    isLoading.value = true; // Activer le GIF pendant le traitement
    const API_URL = "http://localhost:1234/v1/completions";

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "deepseek-r1-distill-qwen-7b", // Nom du modèle à utiliser dans LM Studio
            prompt: Question,
            temperature: 0.1, // Ajuste selon le besoin
            max_tokens: 500, // Limite le nombre de tokens de la réponse
            stop: null
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log("Réponse de l'API :", data);

            // Extraire uniquement la partie JSON de la réponse de l'IA
            let parsedResponse = extractJsonFromResponse(data.choices[0].text);

            if (parsedResponse) {
                results.value.correction.push({
                    axis: currentAxis,
                    response: parsedResponse,
                    score: getRealScore(currentAxis, parsedResponse.answer, elID)
                });

                results.value.AImodel = data.model;
            } else {

                console.error(`Tentative ${attempt}: Impossible d'extraire une réponse JSON valide.`);

                // 🔄 Relancer l'API si on n'a pas atteint la limite des tentatives
                if (attempt < maxRetries) {
                    console.warn(`Relance de l'API... Tentative ${attempt + 1}`);
                    askLMStudio(Question, currentAxis, attempt + 1, maxRetries);
                } else {
                    console.error("Échec après plusieurs tentatives.");
                }
            }

            isLoading.value = false;
        })
        .catch(error => {
            console.error("Erreur :", error);

            isLoading.value = false;
        });
};

//EXTRACTOR FOR DEEPSEEK CLEANING THINKING
function extractJsonFromResponse(responseText) {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
    if (jsonMatch && jsonMatch[1]) {
        try {
            return JSON.parse(jsonMatch[1]); // Convertir en objet JSON
        } catch (error) {
            console.error("Erreur de parsing JSON :", error);
            return null;
        }
    }
    console.warn("Aucun JSON trouvé dans la réponse AI.");
    return null;
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

/* axis to evaluate
   AICorr true or false estimated by AI */
var memoAxis = []

function getRealScore(axis, AICorr, elID) {
    // Trouver l'élément correspondant à elID
    console.log("COMBIEN DE CALL POUR GetRealScore ?")
    const element = props.testData.elements.find(el => el.el_ID === elID);
    console.log(memoAxis)

    if (memoAxis.includes(axis)) {
        return
    } else {

        // Vérifier si l'élément a été trouvé et s'il contient correctionAxes
        if (!element || !element.correctionAxes) {
            console.warn(`Élément avec ID ${elID} non trouvé ou ne contient pas de correctionAxes`);
            return null;
        }

        // Trouver l'axe correspondant
        const correction = element.correctionAxes.find(corr => corr.axis === axis);
        console.log(correction.axis)




        if (!correction) {
            console.warn(`Axe "${axis}" non trouvé pour l'élément ${elID}`);
            return null;
        }

        // Retourner la valeur en fonction de AICorr
        const score = AICorr ? Number(correction.point) : -Number(correction.penalty);
        console.log(score)
        partialScore.value.push(score);
        memoAxis.push(axis);

          // Mise à jour du total des scores IA
          totalQScore.value = partialScore.value.reduce((sum, s) => sum + s, 0);
        console.log(`totalQScore mis à jour : ${totalQScore.value}`);
        return score;
    }
}


</script>

<style scoped>
.cardReport {
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid gainsboro;
    border-radius: 5px;
}

.totalQScore {
    height: 100%;
    margin: -5px -5px 0px -5px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
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
}

.scoreContainerLarge {
    margin-top: -2px;
    display: flex;
    justify-content: center;
    /* Centre horizontalement */
    align-items: center;
    /* Centre verticalement */

    border: 3px solid grey;
    /* Juste pour voir la div */
}

.AIProcess {
    background-color: gainsboro;
    text-align: center;
    padding: 5px 5px 0px 5px;
    margin: -10px 10px -10px -10px;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}

.loading-gif {
    width: 50px;
    height: 50px;
    margin-bottom: 10px;
}

.GetAIBT {
    font-size: 0.8em;
    margin: -5px -5px -5px -5px;
    border: 1px grey solid;
    border-top-left-radius: 5px;
    border-bottom-left-radius: 5px;
}
.MainResultContainer{
    border : 1px gainsboro solid;
    border-radius: 5px;
    padding : 10px;
    margin : 10px;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05);
}
.message {
            color: rgb(87, 132, 205);
            animation: blink 3s ease-in-out 12;
            font-weight: bold;
        }

        @keyframes blink {
            0%, 100% { color: rgb(17, 255, 0); }
            50% { color: transparent; color: rgb(187, 32, 24); }
        }
</style>
