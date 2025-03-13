<template>
    <div>
        <h3>Edit Publication</h3>
        <form @submit.prevent="updatePublication">
            <div class="row">
                <div class="col">
                    <div class="form-floating mb-3">
                        <input type="text" class="form-control" v-model="publicationData.publicationName"
                            placeholder="Publication Name" />
                        <label>Publication Name</label>
                    </div>
                </div>
                <div class="col">
                    <div class="form-floating">
                        <select class="form-select" v-model="publicationData.access" id="access">
                            <option value="unique">Unique</option>
                            <option value="multiple">Multiple</option>
                        </select>
                        <label for="access" class="form-label">Access</label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <div class="form-floating">
                        <select class="form-select" v-model="publicationData.testId" :disabled="!tests.length">
                            <option value="" disabled>Select a Test</option>
                            <option v-for="test in tests" :key="test._id" :value="publicationData.testId">
                                {{ test.title }}
                            </option>
                        </select>
                        <label>Test</label>
                    </div>
                </div>
                <div class="col">
                    <div class="form-floating">
                        <select class="form-select" v-model="publicationData.groupId._id" :disabled="!groups.length">
                            <option value="" disabled>Select a Group</option>
                            <option v-for="group in groups" :key="group._id" :value="group._id">
                                {{ group.groupName }}
                            </option>
                        </select>
                        <label>Group</label>
                    </div>
                </div>
            </div>
            <div class="row mt-3">
                <div class="col">
                    <div class="form-floating mb-3">
                        <input type="date" class="form-control"
                            :value="formatDateForInput(publicationData.startingDate)" @input="updateStartingDate" />
                        <label>Starting Date</label>
                    </div>
                </div>
                <div class="col">
                    <div class="form-floating mb-3">
                        <input type="date" class="form-control" :value="formatDateForInput(publicationData.endDate)"
                            @input="updateEndDate" />
                        <label>End Date</label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="form-floating">
                    <textarea class="form-control" v-model="publicationData.description"
                        placeholder="Add some important details"></textarea>
                    <label style="margin-left:10px">Description</label>
                </div>
            </div>
            <div class="row mt-4 mb-2">
                <div class="col-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="publicationData.reports.studentReport"
                            id="StudentReport">
                        <label class="form-check-label" for="StudentReport">
                            Student Report
                        </label>
                    </div>
                </div>
                <div class="col-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="publicationData.reports.groupReport"
                            id="GroupReport">
                        <label class="form-check-label" for="GroupReport">
                            Group Report
                        </label>
                    </div>
                </div>

                <div class="col-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" v-model="publicationData.reports.statReport"
                            id="StatisticReport" checked>
                        <label class="form-check-label" for="StatisticReport">
                            Statistic Report
                        </label>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col">
                    <button type="submit" class="btn btn-primary">Update Publication</button>
                </div>
                <div class="col" style="text-align: right;">
                    <button type="submit" class="btn btn-danger">Delete Publication</button>
                </div>
            </div>


        </form>
    </div>
</template>

<script setup>
import { ref, watch } from "vue";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const props = defineProps({
    publication: {
        type: Object,
        required: true,
    },
});

// Utiliser `ref` pour les listes
const tests = ref([]);
const groups = ref([]);

// Créer une copie réactive des données de publication
const publicationData = ref({ ...props.publication });
console.log(publicationData)

// Surveiller les changements de la prop `publication`
watch(
    () => props.publication,
    (newValue) => {
        publicationData.value = { ...newValue }; // Mettre à jour les données locales
    },
    { immediate: true, deep: true }
);

watch(tests, (newTests) => {
    console.log("Tests récupérés :", tests.value);
console.log("Test ID actif :", publicationData.value.testId._id);
    if (newTests.length > 0 && !publicationData.value.testId) {
        // Vérifier si l'ID actuel correspond à un test existant
        const matchingTest = newTests.find(test => test._id === props.publication.testId);
        if (matchingTest) {
            publicationData.value.testId = matchingTest._id;
        }
    }
}, { immediate: true, deep: true });



// Fonction pour formater la date pour l'input
const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0];
};

// Fonctions de mise à jour des dates
const updateStartingDate = (event) => {
    publicationData.value.startingDate = event.target.value;
};

const updateEndDate = (event) => {
    publicationData.value.endDate = event.target.value;
};

// Charger la liste des tests et des groupes

async function fetchTests() {
    try {
        const [testResponse, groupResponse] = await Promise.all([
            axios.get(`${VITE_API_BASE_URL}/api/tests/list`),
            axios.get(`${VITE_API_BASE_URL}/api/groups/list`)
        ]);

        tests.value = testResponse.data;
        groups.value = groupResponse.data;
    } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
    }
}

// Mettre à jour la publication
async function updatePublication() {
    const today = new Date();
    const startingDate = new Date(publicationData.value.startingDate);
    const endDate = new Date(publicationData.value.endDate);

    // Gestion des cas selon les dates
   // if (today < startingDate) {
        // Cas 1 : Avant la date de début (Coming)
        try {
            await axios.put(
                `${VITE_API_BASE_URL}/api/publications/${publicationData.value._id}`,
                publicationData.value
            );
            alert("Publication updated successfully!");
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la publication :", error);
        }
    /* } else if (today >= startingDate && today <= endDate) {
        // Cas 2 : Pendant la session (Open)
        alert("Modification impossible : the publication is running.");
    } else if (today > endDate) {
        // Cas 3 : Après la date de fin (Closed)
        alert("Modification impossible : the session is over.");
    } */
}

// Charger les tests et les groupes au montage
fetchTests();
console.log("Tests récupérés :", tests.value);
console.log("Test ID actif :", publicationData.value.testId);

</script>