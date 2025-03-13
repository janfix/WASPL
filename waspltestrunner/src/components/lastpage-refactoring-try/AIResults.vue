<template>
    <div>
      <div v-if="isLoading">
        <img src="../assets/loading.gif" alt="Loading..." class="loading-gif" />
        <p>Processing your answer, please wait...</p>
      </div>
      
      <div v-else>
        <div v-if="results.correction.length > 0">
          <i>{{ answer.questionLabel }}</i> <br>
          <h5>AI Correction :</h5>
  
          <div v-for="(correction, index) in results.correction" :key="index" class="card mb-3">
            <div class="card-body">
              <h6 class="card-title"><strong>Axis:</strong> {{ correction.axis }}</h6>
              <p><strong>Response:</strong> {{ correction.response.comment }}</p>
              <p><strong>Score Q:</strong> {{ correction.response.score }} / 10</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const props = defineProps({
    answer: Object,
  });
  
  const isLoading = ref(false);
  const results = ref({
    correction: []
  });
  
  </script>
  