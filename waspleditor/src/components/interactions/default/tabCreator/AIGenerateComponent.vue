<template>
    <div>
        <div class="ia-form-container">
            <h3>Generate elements using AI</h3>

            <!-- Sélection du type d'interaction -->
            <label for="">Choose an interaction:</label>
            <select class="form-select" v-model="selectedInteraction">
                <option v-for="(interaction, key) in interactionTypes" :key="key" :value="key">
                    {{ key }}
                </option>
            </select>

            <!-- Zone pour le prompt principal -->
            <p class="mt-2 AiInstruction">
                Specify how many questions of this kind you want on what topic. They will be added to the current page.
            </p>
            <div class="form-floating">
                <textarea class="form-control" placeholder="Main Prompt" id="MainPrompt"
                    v-model="mainPrompt"></textarea>
                <label for="MainPrompt">Main Prompt</label>
            </div>

            <!-- Zone pour le prompt de correction -->
            <p class="mt-2 AiInstruction">
                Specify the weight of the correct answers and possible penalties.
            </p>
            <div class="form-floating mt-2">
                <textarea class="form-control" placeholder="Correction Prompt" id="CorrectionPrompt"
                    v-model="correctionPrompt"></textarea>
                <label for="CorrectionPrompt">Correction Prompt</label>
            </div>

            <!-- Affichage du prompt complet -->
            <div class="hiddenPrompt mt-3">
                <textarea class="form-control" id="revealedPrompt" readonly>{{ superPrompt }}</textarea>
            </div>

            <!-- Boutons d'action -->
            <div class="row mt-3">
                <div class="col">
                    <button type="button" class="btn btn-warning btn-sm" @click="editPrompt">
                        Edit the Prompt
                    </button>
                </div>
                <div class="col text-end">
                    <!-- Composant AIInteraction avec le prompt généré localement -->
                    <AIInteraction 
                        :prompt="superPrompt" 
                        :selectedInteraction="selectedInteraction"
                        :jsonModelText="jsonModelText" 
                        :selectedElement = "props.selectedElement"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

const props = defineProps({
    prompt: String,
    selectedElement: Object, // Access the selectedElement prop
});

import { ref, computed, watch } from "vue";
import choiceModel from "../../choice/model.json";
import orderModel from "../../order/model.json";
import messageModel from "../../message/model.json";
import shortAnswer from "../../shortAnswer/model.json";
import textGaps from "../../textGaps/model.json";
import AIInteraction from "../../../AIInteraction.vue";

// Variables locales pour gérer les données
const mainPrompt = ref("");
const correctionPrompt = ref("");
const jsonModelText = ref(""); // JSON formaté en texte
const selectedInteraction = ref("");

// Interaction types
const interactionTypes = {
    choice: "Choice Interaction",
    order: "Order Interaction",
    message: "Message Interaction",
    shortAnswer: "Short Answer",
    textGaps: "Text Gaps",
};

// Générer dynamiquement le superPrompt
const superPrompt = computed(() => {
    return `
    Main Instructions:\n${mainPrompt.value}\n\n
    Correction Details:\n${correctionPrompt.value}
    `;
});

// Charger le modèle JSON correspondant à l'interaction sélectionnée
const loadInteractionModel = async () => {
    if (selectedInteraction.value === "choice") {
        jsonModelText.value = JSON.stringify(choiceModel, null, 2);
    } else if (selectedInteraction.value === "order") {
        jsonModelText.value = JSON.stringify(orderModel, null, 2);
    } else if (selectedInteraction.value === "message") {
        jsonModelText.value = JSON.stringify(messageModel, null, 2);
    } else if (selectedInteraction.value === "shortAnswer") {
        jsonModelText.value = JSON.stringify(shortAnswer, null, 2);
    } else if (selectedInteraction.value === "textGaps") {
        jsonModelText.value = JSON.stringify(textGaps, null, 2);
    } else {
        jsonModelText.value = "";
    }
};

// Observer les changements de l'interaction sélectionnée
watch(selectedInteraction, async () => {
    await loadInteractionModel();
});

// Modifier le prompt
const editPrompt = () => {
    alert("You can modify the main and correction prompts to refine the generated JSON.");
};
</script>

<style scoped>
.AiInstruction {
    font-style: italic;
    margin-top: 10px;
    margin-bottom: -2px;
}

.hiddenPrompt {
    border-radius: 5px;
    margin-top: 10px;
    width: auto;
    height: auto;
    background-color: slategray;
    color: white;
    padding: 10px;
}

#revealedPrompt {
    background-color: transparent;
    color: white;
    width: 100%;
    height: auto;
}
</style>