<template>
    <InteractionPreviewDivChoice 
      :options="question.options"
      :question-text="question.text"
      :multiple="question.multiple"
      :feedback-visible="false"
      mode="test" />
  </template>
  
  <script setup>
 defineProps({
    question: {
        type: Object,
        required: true,
    },
    testData: {
        type: Object,
        required: true,
    },
});
  </script>
  