<template>
    <div>
      <h3>Choose an interaction to create a new component</h3>
      <form @submit.prevent="saveElement">
          <!-- Sélection du type d'interaction -->
          <div class="form-group">
            <select v-model="selectedElement.el_Type" class="form-select">
              <option v-for="(interaction, key) in interactionTypes" :key="key" :value="key">
                {{ key }}
              </option>
            </select>
          </div>
        </form>
    </div>
  </template>

<script setup>
import { useTestStore } from '../../../../stores/testStore';
import { computed, watch } from 'vue';
import { interactions } from '../../../../../interactions';
import { v4 as uuidv4 } from 'uuid'; // Importer UUID


const store = useTestStore();
const selectedElement = computed(() => store.selectedElement);

// Interaction types disponibles
const interactionTypes = interactions;

// Charger dynamiquement le modèle JSON et ajouter un el_ID
const loadInteractionModel = async (type) => {
  if (interactions[type]?.model) {
    const model = await interactions[type].model();
    store.updateElement({
      ...model,
      el_ID: uuidv4(), // Générer un identifiant unique pour le nouvel élément
    });
  }
};

// Watch pour détecter les changements de type d'interaction
watch(
  () => selectedElement.value?.el_Type,
  (newType) => {
    if (newType) {
      loadInteractionModel(newType);
    }
  }
);
</script>