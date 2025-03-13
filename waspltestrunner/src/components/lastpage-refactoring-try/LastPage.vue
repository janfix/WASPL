<template>
    <div class="default">
      <h1>The test is now over.</h1>
      <p>Your answers have been sent! Thank you for your participation.</p>
    </div>
  
    <hr>
  
    <InstantReport v-if="testData.settings.directScore_FB"
                   :testData="testData"
                   :allAnswers="allAnswers" />
  
    <hr>
  
    <div class="AIfeedback">
      <p>This component uses a local AI to generate:</p>
      <h3>AI comment</h3>
      <ul>
        <li>It is a comment on the performance:</li>
        <li>Constructive criticism</li>
      </ul>
      <h3>AI advice and greetings</h3>
      Here are some tips to do better.
      <li>Cheers</li>
      <li>Congratulations</li>
    </div>
  </template>
  
  <script setup>
  import { useResponsesStore } from '../stores/useResponsesStore.js';
  import InstantReport from './InstantReport.vue';
  
  const props = defineProps({
    testData: {
      type: Object,
      required: true,
    },
  });
  
  const responsesStore = useResponsesStore();
  const allAnswers = responsesStore.$state.responses;
  
  </script>
  