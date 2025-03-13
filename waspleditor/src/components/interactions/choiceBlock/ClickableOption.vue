<template>
    <div 
      :class="['clickable-option', { active: isSelected }]" 
      @click="handleClick"
      @mouseover="hovered = true"
      @mouseleave="hovered = false">
      {{ option.text }}
    </div>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  
  // Props
  defineProps({
    option: { type: Object, required: true },
    selectedAnswers: { type: [Array, String], required: true },
    multiple: { type: Boolean, required: true },
  });
  
  // State
  const hovered = ref(false);
  
  // Check if the option is selected
  const isSelected = computed(() => {
    return multiple
      ? selectedAnswers.includes(option.id)
      : selectedAnswers === option.id;
  });
  
  // Handle click
  function handleClick() {
    if (multiple) {
      // Toggle selection for multiple choice
      const index = selectedAnswers.indexOf(option.id);
      if (index > -1) {
        selectedAnswers.splice(index, 1);
      } else {
        selectedAnswers.push(option.id);
      }
    } else {
      // Set selection for single choice
      selectedAnswers = option.id;
    }
  }
  </script>
  
  <style scoped>
  .clickable-option {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
    cursor: pointer;
    user-select: none;
    transition: background-color 0.3s, transform 0.2s;
  }
  
  .clickable-option:hover {
    background-color: #f0f0f0;
  }
  
  .clickable-option.active {
    background-color: #007bff;
    color: white;
    transform: scale(0.95);
  }
  </style>
  