<template>
  <div>
    <div class="mb-4">
      <h1>Group List for Publication</h1>
      <div class="row g-2 align-items-center">
        <!-- Select for Filter Field -->
        <div class="col-md-4">
          <label for="filter-field" class="form-label">Filter by</label>
          <select id="filter-field" ref="fieldEl" class="form-select">
            <option value="" selected>Choose a field...</option>
            <option value="_id">ID</option>
            <option value="groupName">Group Name</option>
            <option value="description">Description</option>
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
        <div class="col-md-1 d-flex align-items-end">
          <button id="filter-apply" class="btn btn-primary w-100 btn-sm mt-4" @click="updateFilter">
            Apply
          </button>
        </div>

        <!-- Clear Filter Button -->
        <div class="col-md-1 d-flex align-items-end">
          <button id="filter-clear" class="btn btn-outline-secondary w-100 btn-sm mt-4" @click="clearFilter">
            Clear
          </button>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div id="Grouptable" ref="groupTableEl"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { TabulatorFull as Tabulator } from "tabulator-tables";
import { v4 as uuidv4 } from "uuid";



// Référence à la table et autres éléments
const tableId = uuidv4();
const fieldEl = ref(null);
const typeEl = ref(null);
const valueEl = ref(null);
const groupTableEl = ref(null);
let groupTable = null;

const props = defineProps({
  groups: {
    type: Array,
    required: true
  }
});

// Définir un événement pour émettre l'ID du groupe sélectionné
const emit = defineEmits(["group-selected"]);

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// Fonction pour récupérer les groupes
async function fetchGroups({ page = 1, size = 10, sorters = [], filters = [] } = {}) {
  try {
    console.log(`📡 Fetching groups - Page: ${page}, Size: ${size}, Sorters:`, sorters, "Filters:", filters); // Debug

    const response = await axios.get(`${VITE_API_BASE_URL}/api/groups`, {
      params: { page, size, sorters, filters }
    });

    if (!Array.isArray(response.data.groups)) {
      console.error("❌ Erreur: la réponse API ne contient pas un tableau", response.data);
      return { data: [], last_page: 1 };
    }

    return {
      data: response.data.groups,
      last_page: response.data.last_page
    };

  } catch (error) {
    console.error("❌ Erreur lors de la récupération des GROUPS!!! :", error);
    return { data: [], last_page: 1 };
  }
}





// Fonction pour charger Tabulator
function loadTable() {
  if (groupTable) {
    groupTable.setData(); // Recharge les données si la table existe
    return;
  }

  groupTable = new Tabulator(groupTableEl.value, {
    pagination: true,
    paginationMode: "remote", // Pagination distante
    paginationSize: 10,
    paginationSizeSelector: [10, 20, 50, 100],
    paginationCounter: "rows",

    ajaxURL: `${VITE_API_BASE_URL}/api/groups`, // URL de base de l'API

    // ✅ Construit dynamiquement l’URL avec les bons paramètres
    ajaxURLGenerator: (url, config, params) => {
      const page = params.page || 1;
      const size = params.size || 10;

      const fullUrl = new URL(url);
      fullUrl.searchParams.set("page", page);
      fullUrl.searchParams.set("size", size);

      // Tu peux aussi ajouter plus tard :
      // fullUrl.searchParams.set("sorters", JSON.stringify(params.sorters));
      // fullUrl.searchParams.set("filters", JSON.stringify(params.filters));

      console.log("🔗 URL générée pour appel API :", fullUrl.toString());
      return fullUrl.toString();
    },

    // ✅ Analyse la réponse de l’API
    ajaxResponse: (url, params, response) => {
      console.log("📊 Réponse API reçue :", response);

      // Tabulator attend un objet { data: [], last_page: n }
      return {
        data: response.groups,
        last_page: response.last_page
      };
    },

    ajaxSorting: true,
    ajaxFiltering: true,

    height: "auto",
    layout: "fitColumns",
    selectable: true,

    columns: [
      { title: "ID", field: "_id", width: 150 },
      { title: "Group Name", field: "groupName" },
      { title: "Institution", field: "institution" },
      { title: "Students", field: "students.length" },
      { title: "Location", field: "location" },
      { title: "Zipcode", field: "zipCode" },
      { title: "Grade", field: "grade" },
      { title: "Sector", field: "sector" },
      {
        title: "Actions",
        field: "actions",
        hozAlign: "center",
        formatter: () => `
          <button class="delete-btn" style="background:none;border:none;cursor:pointer;font-size:16px;">❌</button>
          <button class="edit-btn" style="background:none;border:none;cursor:pointer;font-size:16px;">
              <i class="fa fa-edit" title="Edit"></i>
          </button>
        `,
        cellClick: (e, cell) => {
          const target = e.target;

          if (target.closest(".edit-btn")) {
            emit("group-edit", cell.getRow().getData());
          }

          if (target.closest(".delete-btn")) {
            const groupId = cell.getRow().getData()._id;
            deleteGroup(groupId);
          }
        },
      },
    ],
  });

  groupTable.on("rowClick", (e, row) => {
    const groupId = row.getData()._id;
    emit("group-selected", groupId);
  });
}



// Fonction pour appliquer un filtre
function updateFilter() {
  const filterField = fieldEl.value.value;
  const filterType = typeEl.value.value;
  const filterValue = valueEl.value.value;

  console.log("Applying filter:", { filterField, filterType, filterValue }); // Log pour vérifier les valeurs

  if (filterField && filterType && filterValue) {
    groupTable.setFilter(filterField, filterType, filterValue);
  } else {
    console.warn("Filter not applied: missing field, type, or value");
  }
}


async function deleteGroup(groupId) {
  if (!confirm("Are you sure you want to delete this group?")) return;

  try {
    await axios.delete(`${VITE_API_BASE_URL}/api/groups/${groupId}`);
    alert("Group deleted successfully");
    groupTable.setPage(1);// Rechargez les données après suppression
  } catch (error) {
    console.error("Erreur lors de la suppression du groupe :", error.message);
    alert("Failed to delete group. Please try again.");
  }
}


// Fonction pour effacer les filtres
function clearFilter() {
  fieldEl.value.value = "";
  typeEl.value.value = "=";
  valueEl.value.value = "";
  groupTable.clearFilter();
}

// Charger les données lors du montage
onMounted(() => {
  loadTable();
});

// Surveillance des changements de données
/* watch(
  () => props.groups,
  (newGroups) => {
    if (groupTable) {
      groupTable.setData(newGroups); // Recharge les données dans la table
    }
  },
  { deep: true } // Nécessaire pour surveiller les changements profonds dans un tableau
); */
</script>
