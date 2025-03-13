<script setup>
import studentImport from "../students/StudentImportComponent.vue";
import groupList from "../students/groupList.vue";
import studentList from "../students/studentList.vue";
import add1student from "../students/add1student.vue";
import groupCreator from "../students/groupCreator.vue";
import groupCardEditor from "../students/groupCardEditor.vue";
import axios from "axios";
import { ref,onMounted  } from "vue";

// Identifiant du groupe sélectionné
const selectedGroupId = ref(null);
const selectedGroupForEdit = ref(null);



// Liste des groupes
const groupListData = ref([]); // Déclarez groupListData

// Appeler la méthode pour rafraîchir la liste des groupes au montage
onMounted(() => {
    refreshGroupList(); // Charge les données des groupes à l'initialisation
});


// Rafraîchir la liste des groupes
async function refreshGroupList() {

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

    try {
        const response = await axios.get(`${VITE_API_BASE_URL}/api/groups`);
        groupListData.value = response.data; // Met à jour la liste des groupes
        selectedGroupForEdit.value = null;  // Ferme l'éditeur après mise à jour
        //alert("Group list refreshed!");
    } catch (error) {
        console.error("Error refreshing group list:", error);
        alert("Failed to refresh group list.");
    }
}

// Ouvrir l'éditeur de groupe
function showGroupCardEditor(group) {
    console.log("Données du groupe à éditer :", group); // Log pour debug
    selectedGroupForEdit.value = { ...group }; // Force la création d'un nouvel objet pour garantir la réactivité
}

// Filtrer par groupe
function filterByGroup(groupId) {
    console.log("ID du groupe reçu :", groupId); // Vérifiez que l'ID est reçu
    selectedGroupId.value = groupId;
}

const showImport = ref(false);
const showAdd1Student = ref(false);
const showGroupCreator = ref(false);

const toggleShowImport = () => {
    showImport.value = !showImport.value;
    showGroupCreator.value = false;
    showAdd1Student.value = false;
};

const toggleshowAdd1Student = () => {
    showImport.value = false;
    showGroupCreator.value = false;
    showAdd1Student.value = !showAdd1Student.value;
};

const toggleshowGroupCreator = () => {
    showImport.value = false;
    showAdd1Student.value = false;
    showGroupCreator.value = !showGroupCreator.value;
};
</script>

<template>
  <div class="main tab">
    <div class="groupContainer">
      <button @click="toggleshowGroupCreator()" type="button" class="btn btn-primary ActionCreator-btn">Create a new Group</button>
      <button @click="toggleshowAdd1Student()" type="button" class="btn btn-primary ActionStud-btn">Add a Student</button>
      <button @click="toggleShowImport()" type="button" class="btn btn-Success ActionImport-btn">Import Students</button>
    
      <groupCreator v-if="showGroupCreator" />
      <add1student v-if="showAdd1Student" />
      <studentImport v-if="showImport" />

      <!-- Liste des groupes -->
      <hr />
      <groupList 
          :groups="groupListData" 
          @group-selected="filterByGroup" 
          @group-edit="showGroupCardEditor" 
      />
      <hr />
      <groupCardEditor 
          v-if="selectedGroupForEdit" 
          :group="selectedGroupForEdit" 
          @close="selectedGroupForEdit = null" 
          @updated="refreshGroupList"
      />

      <!-- Liste des étudiants -->
      <studentList :filter-group-id="selectedGroupId" />
    </div>
  </div>
</template>



<style>
.tab {
  border-left: 1px gainsboro solid;
  background-color: #F8F9FA;
  padding-top: 30px;
}

.groupContainer{
  margin:20px;
}

.ActionStud-btn {
  background-color: #426c9c;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-bottom: 10px;
  margin-left: 2px;
  cursor: pointer !important;
  width: 200px !important;
}

.ActionStud-btn:hover {
  background-color: #2e4c6d!important;
}


.ActionImport-btn {
  background-color: #9f42bb;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-bottom: 10px;
  margin-left: 2px;
  cursor: pointer !important;
  width: 200px !important;
}

.ActionImport-btn:hover {
  background-color: #5d0d90;
  color:white;
}

.ActionCreator-btn {
  background-color: #b5af16;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 5px 10px;
  margin-bottom: 10px;
  margin-left: 2px;
  cursor: pointer !important;
  width: 200px !important;
}

.ActionCreator-btn:hover {
  background-color: #bac466;
  color:white;
}
</style>
  