<template>
    <div class="card">
        <div class="card-header" >
            <div class="row">
                <div class="col-9">
                <b>IMPORT NEW ITEM FROM THE ITEM COLLECTION</b> <br/>
                    <i>Search an item in the collection and drag&drop your choice on a page</i>
                </div>
                <div class="col-3" style="text-align: right;">
                    <button 
                    title="Close Item Library"  
                    type="button" 
                    class="btn btn-secondary"
                    @click="$emit('close')">
                        X
                    </button>
                </div>
            </div>
            
        </div>
        <div class="card-body">
            <div>
    <h3>Item Collection</h3>
    <input
      type="text"
      v-model="searchQuery"
      class="form-control mb-3"
      placeholder="Search items by label, text, rich text, or keywords..."
    />
    
    <!-- Affichage des items filtrés -->
    <div class="item-grid">
      <div
        class="item-card"
        v-for="item in filteredItems"
        :key="item.el_ID"
        draggable="true"
        @dragstart="onDragStart(item)"
      >
        <h4>{{ item.el_Label }}</h4>
        <p>{{ item.el_Text }}</p>
        <p v-if="item.el_keywords.length">
          Keywords: {{ item.el_keywords.join(', ') }}
        </p>
      </div>
    </div>
  </div>

        </div>
    </div>

</template>

<script setup>
import { ref, onMounted,computed } from "vue";
import axios from "axios";

const VITE_API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const props = defineProps({
  isVisible: Boolean,
});

const emit = defineEmits(["close"]);

const items = ref([]);
const searchQuery = ref(""); 

// Simule le drag-and-drop
const onDragStart = (item) => {
  event.dataTransfer.setData("application/json", JSON.stringify(item));
};

// Filtrage des items
const filteredItems = computed(() => {
  if (!searchQuery.value.trim()) return items.value;

  const query = searchQuery.value.toLowerCase();

  return items.value.filter((item) => {
    return (
      item.el_Label.toLowerCase().includes(query) ||
      item.el_Text.toLowerCase().includes(query) ||
      item.el_RichText.toLowerCase().includes(query) ||
      item.el_keywords.some((keyword) => keyword.toLowerCase().includes(query))
    );
  });
});

const fetchItems = async () => {
  try {
    const response = await axios.get("http://localhost:4000/api/items"); // API pour récupérer les items
    items.value = response.data;
    console.log(response)
  } catch (error) {
    console.error("Erreur lors de la récupération des items :", error);
  }
};

onMounted(fetchItems);
</script>

<style scoped>
.form-control {
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.item-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.item-card {
  width: 150px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #f9f9f9;
  cursor: grab;
}
.item-card:active {
  cursor: grabbing;
}

.item-card:hover{
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.05); 
}

h4{
    font-size: 1.1rem;
}

.badge-secondary{
    color:#c42020;
    border : 1px gainsboro solid;
}

.mainQ{
    font-size: 0.9rem;
}
</style>