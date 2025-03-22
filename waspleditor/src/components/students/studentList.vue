<template>
    <div class="StudentListContainer">
        <h1>Student database</h1>

        <!-- Bouton pour vider la base -->
        <div class="mb-4">
            <button class="btn btn-danger mr-2" @click="deleteAllStudents">
                Clear All Students
            </button>

            <button class="btn btn-secondary" @click="resetGroupFilter">
                Reset Group Filter
            </button>
        </div>
        <div class="mb-4">
            <div class="row g-2 align-items-center">
                <!-- Select for Filter Field -->
                <div class="col-md-4">
                    <label for="filter-field" class="form-label">Filter by</label>
                    <select id="filter-field" ref="fieldEl" class="form-select">
                        <option value="" selected>Choose a field...</option>
                        <option value="_id">ID</option>
                        <option value="lastname">Student Name</option>
                        <option value="institution">Institution</option>
                        <option value="grade">Grade</option>
                        <option value="sector">Sector</option>
                        <option value="location">Location</option>
                        <option value="zipcode">ZipCode</option>
                    </select>
                </div>

                <!-- Select for Filter Type -->
                <div class="col-md-2">
                    <label for="filter-type" class="form-label">Filter type</label>
                    <select id="filter-type" ref="typeEl" class="form-select">
                        <option value="=">=</option>
                        <option value="like">like</option>
                    </select>
                </div>


                <!-- Input for Filter Value -->
                <div class="col-md-4">
                    <label for="filter-value" class="form-label">Value</label>
                    <input id="filter-value" ref="valueEl" type="text" class="form-control"
                        placeholder="Enter a value..." />
                </div>

                <!-- Clear Filter Button -->
                <div class="col-md-1 d-flex align-items-end ">
                    <button id="filter-clear" class="btn btn-outline-secondary w-100  btn-sm btClearposi"
                        @click="clearFilter">
                        Clear
                    </button>
                </div>
            </div>
        </div>



        <div id="example-table" ref="studTableEl"></div>
    </div>



    <!-- Fenêtre modale pour afficher les détails de l'étudiant -->
    <div class="modal fade" id="studentModal" tabindex="-1" aria-labelledby="studentModalLabel" aria-hidden="true">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="studentModalLabel">Détails de l'étudiant</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <form>
                        <div class="mb-3">
                            <label class="form-label">Prénom</label>
                            <input type="text" class="form-control" v-model="selectedStudent.firstname" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nom</label>
                            <input type="text" class="form-control" v-model="selectedStudent.lastname" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Email</label>
                            <input type="email" class="form-control" v-model="selectedStudent.email" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Institution</label>
                            <input type="text" class="form-control" v-model="selectedStudent.institution" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Spécialité</label>
                            <input type="text" class="form-control" v-model="selectedStudent.sector" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Niveau</label>
                            <input type="text" class="form-control" v-model="selectedStudent.grade" readonly>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Localisation</label>
                            <input type="text" class="form-control" v-model="selectedStudent.location" readonly>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fermer</button>
                </div>
            </div>
        </div>
    </div>



</template>

<script setup>
import { ref, watch, onMounted } from "vue";
import axios from "axios";
import { TabulatorFull as Tabulator } from 'tabulator-tables';
import { v4 as uuidv4 } from 'uuid';
import { Modal } from "bootstrap";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("VITE_API_BASE_URL:", VITE_API_BASE_URL);

const tableId = uuidv4();

const emit = defineEmits(["select-item"]);

const fieldEl = ref(null);
const typeEl = ref(null);
const valueEl = ref(null);
const studTableEl = ref(null);
const studentTable = ref(null);
const props = defineProps({
    filterGroupId: {
        type: String,
        default: null,
    },
});
let defaultPageSize = 20;

const selectedStudent = ref({}); // Étudiant sélectionné
let studentModal = null; // Stocke la modale Bootstrap

function resetGroupFilter() {
    try {
        if (studentTable.value) {
            studentTable.value.clearFilter(); // Réinitialise tous les filtres du tableau
        }
        fetchItems(); // Recharge tous les étudiants
        alert("Group filter reset successfully.");
    } catch (error) {
        console.error("Error resetting group filter:", error);
        alert("Failed to reset group filter.");
    }
}


// Fonction pour afficher la modale avec les infos de l'étudiant
const showStudentModal = (student) => {
    selectedStudent.value = { ...student }; // Stocker les infos de l'étudiant sélectionné

    if (!studentModal) {
        studentModal = new Modal(document.getElementById("studentModal"));
    }
    studentModal.show();
};

const isLoading = ref(false);

// Fonction pour récupérer les données depuis l'API
async function fetchItems(page = 1, size = 20, groupId = null) {
    let response="";
    if (isLoading.value) return;
    isLoading.value = true;
    try {
        let url = `${VITE_API_BASE_URL}/api/students?page=${page}&size=${size}`;
        if (groupId) {
            url += `&groupId=${groupId}`;
            console.log(groupId)
            console.log("Fetching with size:", size, "page:", page);
            response = await axios.get(url);
            console.log("Réponse de l'API :", response.data);
        } else{
            console.log("NO GROUP SPECIFIED")
            console.log("Fetching with size:", size, "page:", page);
            response = await axios.get(url);
            console.log("Réponse de l'API :", response.data);
        }
                
        if (response.data.students && Array.isArray(response.data.students)) {
            studentTable.value.setData(response.data.students);
            studentTable.value.setMaxPage(response.data.totalPages);
            console.log("Total étudiants :", response.data.totalStudents);
        }else {
            console.error("Format de réponse incorrect :", response.data);
        }
    } catch (error) {
        console.error("Erreur lors de la récupération des étudiants :", error);
    } finally {
        isLoading.value = false;  // Assurez-vous de réinitialiser le drapeau
    }
}


// Fonction pour charger Tabulator avec les données récupérées
function loadTable(data) {
    if (studentTable.value) {
        studentTable.value.setData(data); // Recharge les données si la table existe
        return;
    }

    studentTable.value = new Tabulator(studTableEl.value, {
        pagination: "remote",
        paginationSize: 20,
        paginationSizeSelector: [10, 20, 50, 100],
        paginationCounter: "rows",
        ajaxConfig: {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        },
        ajaxLoaderLoading: "<div class='loader'>Chargement...</div>",
        ajaxRequesting: function (url, params) {
            // Retourne true pour permettre la requête
            return !isLoading.value;
        },
        ajaxResponse: function(url, params, response) {
            console.log("Données reçues par Tabulator :", response); // ✅ Vérification API
            return {
                data: response.students, // Les étudiants
                last_page: response.totalPages, // Nombre total de pages
            };
        },
        
        layout: "fitColumns",
        columns: [
            { title: "ID", field: "_id", width: 150 },
            { title: "Firstname", field: "firstname" },
            { title: "Lastname", field: "lastname" },
            { title: "Group", field: "group" },
            { title: "Email", field: "email" },
            { title: "Institution", field: "institution" },
            { title: "Sector", field: "sector" },
            { title: "Grade", field: "grade" },
            { title: "Location", field: "location" },
            { title: "Zip Code", field: "zipcode" },
        ],
    });

    fieldEl.value.addEventListener("change", updateFilter);
    typeEl.value.addEventListener("change", updateFilter);
    valueEl.value.addEventListener("keyup", updateFilter);


    studentTable.value.on("rowClick", function (e, row) {
        // Vérifier si l'événement appartient à cette instance en utilisant tableId
        if (!e.target.closest(`[data-table-id="${tableId}"]`)) {
            return; // Ignorer si ce n'est pas l'instance concernée
        }

        // Vérifier si le clic est sur un bouton d'action
        if (e.target.closest(".action-btn")) {
            return; // Ne rien faire si un bouton a été cliqué
        }


        // Supprimer la sélection de toutes les lignes
        /*  studentTable.getRows().forEach((tableRow) => {
             const element = tableRow.getElement();
             element.classList.remove("tabulator-selected");
             element.style.backgroundColor = "";
             element.style.color = "";
         }); */

        // Ajouter la sélection à la ligne cliquée
        //const element = row.getElement();
        // element.classList.add("tabulator-selected");

        // Récupérer les données de la ligne sélectionnée
        const item = row.getData();

        // Émettre l'événement avec les données sélectionnées
        emitItemSelected(item);
    });


    fieldEl.value.addEventListener("change", updateFilter);
    typeEl.value.addEventListener("change", updateFilter);
    valueEl.value.addEventListener("keyup", updateFilter);
}

const deleteStudent = async (studentId, cell) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet étudiant ?")) {
        return;
    }

    try {
        const response = await axios.delete(`${VITE_API_BASE_URL}/api/students/${studentId}`);
        console.log("Étudiant supprimé :", response.data);

        // Supprimer la ligne dans Tabulator après suppression
        cell.getRow().delete();
    } catch (error) {
        console.error("Erreur lors de la suppression de l'étudiant :", error.response?.data || error.message);
        alert("Impossible de supprimer l'étudiant.");
    }
};

// Fonction pour émettre un événement avec l'item sélectionné
function emitItemSelected(student_selected) {
    console.log("Student Selected :", student_selected);;
    const event = new CustomEvent('select-item', { detail: student_selected });
    studTableEl.value.dispatchEvent(event);
}
// Formatteur pour les mots-clés
function keywordsFormatter(cell) {
    const keywords = cell.getValue();
    return keywords ? keywords.join(", ") : "";
}

// Fonction de mise à jour des filtres
function updateFilter() {
    const filterField = fieldEl.value.value;
    const filterType = typeEl.value.value;
    const filterValue = valueEl.value.value;

    if (filterField && studentTable.value) {
        studentTable.value.setFilter(filterField, filterType, filterValue || "");
    }
}

function clearFilter() {
    if (studentTable.value) {
        studentTable.value.clearFilter(); // Supprime tous les filtres appliqués
    }

    // Réinitialisez les champs du formulaire de filtre
    fieldEl.value.value = "";
    typeEl.value.value = "=";
    valueEl.value.value = "";
}



// Filtrer les étudiants par groupe sélectionné
function filterStudentsByGroup(groupId) {
    if (!studentTable.value || isLoading.value) return;

    // Si un groupe est sélectionné, appliquez le filtre
    if (groupId) {
        studentTable.value.setFilter("group", "=", groupId);
    } else {
        // Sinon, affichez tous les étudiants
        studentTable.value.clearFilter();
    }
}


// Supprimer tous les étudiants
async function deleteAllStudents() {
    if (!confirm("Are you sure you want to delete all students?")) return;

    try {
        await axios.delete(`${VITE_API_BASE_URL}/api/students`);
        alert("All students deleted successfully");
        fetchItems();  // Utilisez fetchItems au lieu de fetchStudents
    } catch (error) {
        console.error("Erreur lors de la suppression des étudiants :", error);
        alert("Failed to delete all students. Please try again.");
    }
}

// Observer les changements de filtre
watch(
    () => props.filterGroupId,
    (newGroupId) => {
        console.log("Filtrer les étudiants pour le groupe :", newGroupId);
        if (!isLoading.value) {
            const totalStudents = studentTable.value.getDataCount();
            fetchItems(1, defaultPageSize, newGroupId);  // Spécifiez la page et la taille
        }
    }
);


onMounted(() => {
    loadTable([]);
    fetchItems();
    
    studTableEl.value.setAttribute("data-table-id", tableId);
    studTableEl.value.addEventListener("select-item", (event) => {
        const item = event.detail;
        emit("select-item", item); // Émettre vers le parent
    });

});
</script>

<style scoped>
/* Reset Tabulator's default row styling */
:deep(.tabulator-row) {
    color: black;
    background-color: transparent !important;
}

:deep(.custom-row) {
    color: black;
    background-color: white;
    transition: background-color 0.2s ease;
}

:deep(.custom-row:hover) {
    background-color: #f5f5f5 !important;
    cursor: pointer;
}

:deep(.tabulator-selected) {
    background-color: #668db8 !important;
    color: white !important;
}

:deep(.tabulator-selected:hover) {
    background-color: #668db8 !important;
}

/* Force override any other Tabulator styles */
:deep(.tabulator-row-odd),
:deep(.tabulator-row-even) {
    background-color: transparent !important;
    color: black !important;
}

.StudentListContainer {
    padding: 10px;
    border: 1px gainsboro solid;
    margin-top: 120px;
    background-color: aliceblue;
}

.mr-2 {
    margin-right: 20px;
}
</style>