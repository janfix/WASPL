<template>
  <div class="bar mb-4">
    <button type="button" class="btn btn-primary">Import QTI item</button>
  </div>

  <div>
    <div class="mb-4">
      <div class="row g-2 align-items-center">
        <!-- Select for Filter Field -->
        <div class="col-md-4">
          <label for="filter-field" class="form-label">Filter by</label>
          <select id="filter-field" ref="fieldEl" class="form-select">
            <option value="" selected>Choose a field...</option>
            <option value="el_Label">Label</option>
            <option value="el_Type">Type</option>
            <option value="el_Text">Text</option>
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
          <input id="filter-value" ref="valueEl" type="text" class="form-control" placeholder="Enter a value..." />
        </div>

        <!-- Clear Filter Button -->
        <div class="col-md-1 d-flex align-items-end ">
          <button id="filter-clear" class="btn btn-outline-secondary w-100  btn-sm mt-4 btClearposi" @click="clearFilter">
            Clear
          </button>
        </div>
      </div>
    </div>



    <div id="itemBankList" ref="tableEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { TabulatorFull as Tabulator } from 'tabulator-tables';


const emit = defineEmits(["select-item"]);

const fieldEl = ref(null);
const typeEl = ref(null);
const valueEl = ref(null);
const tableEl = ref(null);
let table = null;



// Fonction pour récupérer les données depuis l'API
async function fetchItems() {
  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    const response = await axios.get(`${VITE_API_BASE_URL}/api/items`);
    loadTable(response.data);
  } catch (error) {
    console.error("Erreur lors de la récupération des items :", error);
  }
}

// Fonction pour charger Tabulator avec les données récupérées
function loadTable(data) {
  if (table) {
    table.setData(data); // Recharge les données si la table existe
    return;
  }

  table = new Tabulator(tableEl.value, {
    data, // Données récupérées
    height: "500px",
    layout: "fitColumns",
    selectable: true,
    columns: [
      { title: "ID", field: "_id", width: 70 },
      { title: "Label", field: "el_Label", width: 200 },
      { title: "Type", field: "el_Type", width: 150 },
      { title: "Texte", field: "el_Text", width: 300 },
      { title: "grade ISCED", field: "metadata.gradeISCED", width: 150 },
      { title: "Subject", field: "metadata.subject", width: 150 },
      { title: "Domain", field: "metadata.domain", width: 150 },
      { title: "Mots-clés", field: "metadata.keywords", width: 150 },
      {
        title: "Action",
        field: "action",
        width: 80,
        formatter: (cell, formatterParams, onRendered) => {
          const el_id = cell.getRow().getData()._id;
          return `<button style="background: none;
                  border: none;
                  color: red;
                  font-size: 16px;
                  cursor: pointer;" 
                  data-id="${el_id}">❌
                  </button>`;
        },
        cellClick: (e, cell) => {
          const el_id = cell.getRow().getData()._id;
          deleteItem(el_id);
        }
      },
    ],
    rowFormatter: (row) => {
    row.getElement().classList.remove("tabulator-row-odd");
    row.getElement().classList.remove("tabulator-row-even");
  },
  });

  table.on("rowClick", function(e, row) {
    // Remove selection from all rows
    table.getRows().forEach((tableRow) => {
      const element = tableRow.getElement();
      element.classList.remove("tabulator-selected");
      element.style.backgroundColor = "";
      element.style.color = "";
    });

    // Add selection to clicked row
    const element = row.getElement();
    element.classList.add("tabulator-selected");
    
    // Emit the selected item
    const item = row.getData();
    emitItemSelected(item);
  });

  fieldEl.value.addEventListener("change", updateFilter);
  typeEl.value.addEventListener("change", updateFilter);
  valueEl.value.addEventListener("keyup", updateFilter);
}


// Fonction pour émettre un événement avec l'item sélectionné
function emitItemSelected(item) {
  console.log("Item reçu dans itemBank :", item);
  const event = new CustomEvent('select-item', { detail: item });
  tableEl.value.dispatchEvent(event);
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

  if (filterField) {
    table.setFilter(filterField, filterType, filterValue);
  }
}

// Fonction pour effacer les filtres
function clearFilter() {
  fieldEl.value.value = "";
  typeEl.value.value = "=";
  valueEl.value.value = "";
  table.clearFilter();
}

async function deleteItem(el_ID) {
  if (!confirm("Do you really want to delete this item?")) {
    return; // L'utilisateur a annulé la suppression
  }

  const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
  try {
    await axios.delete(`${VITE_API_BASE_URL}/api/items/${el_ID}`);
    console.log(`Item ${el_ID} deleted successfully`);
    
    // Rafraîchir les données après suppression
    fetchItems();
  } catch (error) {
    console.error(`Error deleting item ${el_ID}:`, error);
  }
}


onMounted(() => {
  fetchItems();
  tableEl.value.addEventListener("select-item", (event) => {
    const item = event.detail;
    emit("select-item", item); // Émettre vers le parent
  });
});
</script>

<style scoped>
/* Reset Tabulator's default row styling */
:deep(.tabulator-row) {
  color:black;
  background-color: transparent !important;
}

:deep(.custom-row) {
  color:black;
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
  color:black!important;
}

#itemBankList{
  height:auto!important;
  margin-bottom: 30px;
  
}

.delete-btn {
  background: none;
  border: none;
  color: red;
  font-size: 16px;
  cursor: pointer;
}

.delete-btn:hover {
  color: darkred;
}

</style>