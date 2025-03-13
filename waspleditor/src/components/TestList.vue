<template>
  <div id="test-list" class="TableContainer tabulator">
    <h3>Tests list</h3>
    <div id="test-table" ref="test-table"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useTestStore } from "../stores/testStore";
import { TabulatorFull as Tabulator } from 'tabulator-tables';



const store = useTestStore(); // Utilisation du store Pinia
const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;
console.log("VITE_API_BASE_URL:", VITE_API_BASE_URL);


const tests = ref([]); // Liste réactive des tests
let table = null; // Instance Tabulator

// Fonction pour récupérer les données
const fetchTests = async () => {
  try {
    const response = await axios.get(`${VITE_API_BASE_URL}/api/tests/getTests`);
    console.log("Données récupérées :", response.data);
    tests.value = response.data;

    if (table) {
      table.replaceData(tests.value);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des tests :", error);
  }
};



// Gestion des actions
const handleAction = (e, cell) => {
  const row = cell.getRow();
  const rowData = row.getData();
  if (e.target.classList.contains("preview-btn")) {
    previewTest(rowData);
  } else if (e.target.classList.contains("edit-btn")) {
    editTest(rowData);
  } else if (e.target.classList.contains("delete-btn")) {
    deleteTest(rowData);
  }
};

// Fonction de prévisualisation
const previewTest = (test) => {
  alert(`Previewing Test: ${test.title}`);
};

// Fonction d'édition
// Modified editTest function
const editTest = async (test) => {
  try {
    store.resetState();
    store.setTestData(test);
    
    // Check if the store has the method before calling it
    if (typeof store.saveTestDataToDatabase === 'function') {
      await store.saveTestDataToDatabase();
      //console.log("Test édité avec succès :", test);
      await fetchTests(); // Actualise les données dans Tabulator
    } else {
      //console.log("Test data set in store:", test);
      // If no save method exists, just update the local data
      const index = tests.value.findIndex(t => t.ID === test.ID);
      if (index !== -1) {
        tests.value[index] = { ...test };
        table?.replaceData(tests.value);
      }
    }
  } catch (error) {
    console.error("Erreur lors de l'édition du test :", error);
  }
};


// Fonction de suppression


const deleteTest = async (test) => {
  const testId = test.ID; // Utiliser `ID` pour identifier les tests
  if (confirm(`Are you sure you want to delete Test: ${test.title}?`)) {
    try {
      // Supprimez sur le backend
      const response = await axios.delete(`${VITE_API_BASE_URL}/api/tests/${testId}`);
      console.log(response.data.message);

      // Supprimez localement du store
      store.deleteTestById(testId);

      window.location.reload(); 
      
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
    }
  }
};



// Méthode pour ajouter un test
const addTest = async (newTest) => {
  try {
    const response = await axios.post(`${VITE_API_BASE_URL}/api/tests/addTest`, newTest);
    const savedTest = response.data;
    tests.value.push(savedTest);
  
    table?.replaceData(tests.value); // Mettre à jour Tabulator
    fetchTests();
  } catch (error) {
    console.error("Erreur lors de l'ajout :", error);
  }
};

/*  setInterval(() => {
  fetchTests();
}, 10000); */  // Actualisation toutes les 10 secondes

// Exposer la méthode pour le composant parent
defineExpose({
  addTest,
});

// Initialisation de Tabulator
const initTable = () => {
  table = new Tabulator("#test-table", {
    data: tests.value,
    layout: "fitColumns",
    columns: [
      { title: "Title", field: "title", sorter: "string", headerFilter: "input" },
      { title: "Creation Date", field: "metadata.Created", sorter: "date", headerFilter: "input" },
      { title: "Elements", field: "elements.length", sorter: "number" },
      { title: "Last Modified", field: "metadata.LastModif", sorter: "date" },
      { title: "Subject", field: "Subject", sorter: "string" },
      { title: "Level", field: "level", sorter: "string" },
      {
        title: "Actions",
        field: "actions",
        hozAlign: "center",
        formatter: () => 
        `<button class="action-btn delete-btn" style="background:none;border:none;cursor:pointer;font-size:18px;padding:2px;">❌</button>`,
        cellClick: handleAction,
      },
    ],
    rowFormatter: function (row) {
    const element = row.getElement();
    if (row.getData().isHighlighted) {
      element.classList.add("row-highlight");
    } else {
      element.classList.remove("row-highlight");
    }
  },
  }
);

// Gestion de l'événement rowClick
table.on("rowClick", function (e, row) {
  // Réinitialisez toutes les lignes pour supprimer la sélection
  table.getRows().forEach((r) => r.update({ isHighlighted: false }));

  // Mettez à jour la ligne cliquée avec isHighlighted = true
  row.update({ isHighlighted: true });

  // Appeler la fonction d'édition
  const data = row.getData();
  editTest(data);
});



};

// Watcher pour réinitialiser Tabulator après chargement des données
watch(tests, (newTests) => {
  if (table) {
    table.replaceData(newTests);
  } else {
    initTable();
  }
});

watch(
  () => store.testData,
  (newTestData) => {
    const updatedIndex = tests.value.findIndex((test) => test.ID === newTestData.ID);
    if (updatedIndex !== -1) {
      // Mettre à jour l'élément modifié dans la liste locale
      tests.value[updatedIndex] = { ...newTestData };
    } else {
      // Ajouter un nouvel élément si nécessaire
      tests.value.push({ ...newTestData });
    }
    table?.replaceData(tests.value); // Mettre à jour Tabulator
  },
  { deep: true }
);



// Récupération des données et initialisation
onMounted(async () => {
  await fetchTests();
  initTable();
});
</script>

<style scoped>
#test-table {
  margin-top: 20px;
}
.TableContainer {
  width: 100%;
  height: auto;
}
</style>

<style>
.tabulator-row-even{
  background-color: transparent!important;
}

.tabulator-row-even:hover{
  background-color: #dee2e6!important;
}

.row-highlight {
  background-color: #d3d3d3 !important;
  font-weight: bold !important;
}
</style>