<template>
    <div class="TableContainer">
      <!-- Barre de recherche globale si activée -->
      <div v-if="enableGlobalSearch" class="mb-2">
        <input
          v-model="globalSearch"
          @input="onGlobalSearch"
          type="text"
          class="form-control"
          placeholder="Recherche..."
        />
      </div>
      <div ref="tableRef"></div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from "vue";
  import { TabulatorFull as Tabulator } from "tabulator-tables";
  import axios from "axios";
  
  const props = defineProps({
    apiUrl: { type: String, required: true },
    columns: { type: Array, required: true },
    pageSize: { type: Number, default: 10 },
    enableGlobalSearch: { type: Boolean, default: false },
  });
  
  const tableRef = ref(null);
  let table = null;
  const globalSearch = ref("");
  
  const fetchData = async (url, config, params) => {
    const page = params.page || 1;
    const size = params.size || props.pageSize;
  
    // Filtres colonne ou recherche globale
    const filters = Array.isArray(params.filter) ? params.filter : [];
    let effectiveFilters = filters;
  
    if (props.enableGlobalSearch && globalSearch.value) {
      // Applique la recherche globale sur les champs déclarés dans les colonnes
      effectiveFilters = props.columns
        .filter(col => col.field && col.headerFilter)
        .map(col => ({
          field: col.field,
          type: "like",
          value: globalSearch.value,
        }));
    }
  
    const filterQuery = effectiveFilters.length
      ? `&filters=${encodeURIComponent(JSON.stringify(effectiveFilters))}`
      : "";
  
    const sort = Array.isArray(params.sorters) && params.sorters.length > 0
      ? `&sortField=${params.sorters[0].field}&sortDir=${params.sorters[0].dir}`
      : "";
  
    const fullUrl = `${props.apiUrl}?page=${page}&size=${size}${filterQuery}${sort}`;
  
    const response = await axios.get(fullUrl);
  
    return {
      data: response.data.tests || [],
      last_page: response.data.totalPages || 1,
      total_pages: response.data.totalPages || 1,
      totalItems: response.data.totalItems || 0,
    };
  };
  
  const onGlobalSearch = () => {
    if (table) {
      table.setFilter([]); // vider les filtres précédents pour éviter conflit
      table.setPage(1);
      table.refreshData();
    }
  };
  
  onMounted(() => {
    table = new Tabulator(tableRef.value, {
      ajaxRequestFunc: fetchData,
      paginationMode: "remote",
      paginationSize: props.pageSize,
      paginationSizeSelector: [10, 20, 50, 100],
      paginationCounter: "rows",
      ajaxFiltering: true,
      filterMode: "remote", // 🔥 important
      ajaxSorting: true,
      sortMode: "remote", // 🔥 important
      layout: "fitColumns",
      columns: props.columns,
    });
  });
  </script>
  
  <style scoped>
  .TableContainer {
    width: 100%;
    height: auto;
  }
  </style>
  