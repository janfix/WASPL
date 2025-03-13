<template>
  <div class="sidebar">
    <div class="fixedContainer">
      <CountdownTimer 
        v-if="testData.settings && testData.settings.timeLimit"
        :duration="testData.duration"
        @time-up="$emit('time-up')"
        :stop-timer="stopTimer"
      />
      <div v-else>
        <p>Chargement du test...</p>
      </div>

      <hr>
      <div v-if="testData.preset" class="Mode">{{ testData.preset }} mode</div>
      <hr>

      <div class="TestMapContainer">
        <TestMap 
          v-if="testData.pages && testData.pages.length > 0"
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
import TestMap from "./TestMap.vue"
import CountdownTimer from './CountdownTimer.vue';

// Récupération des props
const props = defineProps({
  testData: {
    type: Object,
    required: true,
  },
  answers: {
    type: Object,
    required: false,
    default: () => ({}), // Par défaut, aucune réponse
  },
  currentPageIndex: {
    type: Number,
    required: true,
  },
 stopTimer: {
    type: Boolean,
    required: false
  }
});

const emit = defineEmits(['time-up', 'navigate-to-page']);

function handleNavigateToPage(index) {
  console.log("✅ TestNavBar - Reçu navigate-to-page avec index:", index);
  emit('navigate-to-page', index); // ✅ Respecte le bon nom
}

</script>

<style scoped>
.sidebar {
  background-color: #F8F9FA;
  height: 100%;
  left: 0;
  padding: 20px;
}

.sidebar ul {
  list-style-type: none;
  padding: 0;
}

.sidebar li {
  margin-bottom: 10px;
  cursor: pointer;
}

.Mode {
  text-align: center;
  padding: 3px;
  font-variant: small-caps;
}

.TestMapContainer {

  text-align: center;
}

.fixedContainer {
  max-width: 130px;
  position: fixed;
}
</style>