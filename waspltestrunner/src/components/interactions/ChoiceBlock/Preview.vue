<template>
    <div>
      <h3>{{ questionText }}</h3>
      <div v-for="(option, index) in options" :key="index">
        <ClickableOption 
          :option="option" 
          :selected-answers="studentAnswers" 
          :multiple="multiple" />
      </div>
      <div v-if="feedbackVisible">
        <p>{{ feedback }}</p>
      </div>
      <button @click="submit" v-if="mode === 'edit' || mode === 'train'">Submit</button>
      <button @click="reset" v-if="mode === 'edit' || mode === 'train'">Reset</button>
    </div>
  </template>
  
  <script setup>
  import ClickableOption from './ClickableOption.vue';
  import { ref } from 'vue';
  
  defineProps({
    options: Array,
    questionText: String,
    multiple: Boolean,
    feedbackVisible: Boolean,
    mode: {
      type: String,
      default: 'edit', // edit | train | test
    },
  });
  
  const studentAnswers = ref(multiple ? [] : null);
  
  function submit() {
    console.log('Submitted answers:', studentAnswers.value);
  }
  
  function reset() {
    studentAnswers.value = multiple ? [] : null;
  }
  </script>
  