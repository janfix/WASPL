<template>
    <div class="card-header">
      <div class="row">
        <div class="col">
         
        </div>
        <div class="col badgeTypePosition">
          <span class="badge bg-info">{{ elementType }}</span>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    elementType: {
      type: String,
      required: true
    }
  });
  </script>
  
  <style scoped>
  .badgeTypePosition {
    text-align: right;
  }

  .card-header{
    background-color: #f0f3f5!important;
    border : 1px solid gainsboro
  }


  </style>