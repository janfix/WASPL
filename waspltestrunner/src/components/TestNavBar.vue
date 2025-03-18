<template>
  <div class='testHeader'>
    <div class="row p-3">
      <div class="col-2" style="text-align: center;"> 
        <img width="100px" src="../assets/waspl.png"><br>
       

      </div>
      <div class="col-10">
        <TestMap 
          @navigate-to-page="handleNavigateToPage"
          :testData="testData" 
          :answers="answers" 
          :currentPageIndex="currentPageIndex"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import TestMap from './TestMap.vue';


// Déclaration des props
const props = defineProps({
  testData: Object,
  answers: Object,
  currentPageIndex: Number
});

// Déclaration des événements émis
const emit = defineEmits(['navigate-to-page']); // ✅ Nom correct

// Fonction pour gérer la navigation
function handleNavigateToPage(index) {
  console.log("✅ TestNavBar - Reçu navigate-to-page avec index:", index);
  emit('navigate-to-page', index); // ✅ Respecte le bon nom
}
</script>

<style scoped>
.testHeader {
  z-index: 1000;
  position:fixed;
  width: 100%;
  background-color:#F8F9FA
}

.wasplLogo {
  font-weight: bold;
  font-size: 0.8em;
}
</style>
