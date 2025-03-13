<template>
    <div class="main">
      <!-- The ITEM-Bank list -->
      <itemList @select-item="handleItemSelection" />
      
      <!-- The item-Previewer -->
      <itemBankPreviewer :selected-item="selectedItem" />

      <!-- The ItemCard for details -->
      <itemCard :selected-item="selectedItem" />
    </div>
  </template>
  
  <script setup>
  import { ref } from "vue";
  import itemList from '../itemBank/itemList.vue';
  import itemCard from '../itemBank/itemCard.vue';
  import itemBankPreviewer from '../itemBank/itemBankPreviewer.vue';
  
  // Référence pour stocker l'item sélectionné
  const selectedItem = ref(null);
  
  // Fonction appelée lorsque l'utilisateur sélectionne un item
  function handleItemSelection(item) {
    selectedItem.value = item;
  }
  </script>
  
  
  <style scoped>
  .main {
    background-color: #F8F9FA;
    padding: 30px;
    border-left: 1px gainsboro solid;
  }
  </style>
  