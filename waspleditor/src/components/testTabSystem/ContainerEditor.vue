<template>
  <div class="row EditorContainer">
    <div class="col-md-3">
      <PagesList 
        @clear-preview-and-editor="clearPreviewAndEditor" 
        @element-clicked="updatePreviewPosition"
        @toggle-item-bank="toggleItemBank" />
    </div>


    <div class="col-md-9">
      <itemBankGrabber v-if="ItemBGrab" @close="toggleItemBank"/>
      <div v-else>
      <PreviewSection class="previewContainer" :element="currentPreviewElement" />
      <ElementEditor  :element="currentEditorElement" />
    </div>
    </div>
  </div>
</template>
<script setup>
import PagesList from '../PagesList.vue'
import ElementEditor from '../ElementEditor.vue'
import PreviewSection from '../PreviewSection.vue'
import itemBankGrabber from './itemBankgrabber.vue'
import { ref, watch } from 'vue';

//This code in the template will reposition the editor and preview sections
//according to the position of the clicked element in the PagesList component.
// :style="{ marginTop: `${dynamicTop}px` }"

const props = defineProps({
  showItemBank: Boolean, // Prop pour l'affichage de l'itemBank
});

watch(
  () => props.showItemBank,
  (newVal) => {
    ItemBGrab.value = newVal;
  }
);

const currentEditorElement = ref(null);
const currentPreviewElement = ref(null);
const ItemBGrab = ref(false); // État pour afficher l'itemBank

const toggleItemBank = () => {
  ItemBGrab.value = !ItemBGrab.value;
  if (!ItemBGrab.value) {
    clearPreviewAndEditor(); // Réinitialiser si on revient à la vue Editor/Preview
  }
};



const updatePreviewPosition = (position) => {
  console.log("Position reçue :", position); // Debug
  dynamicTop.value = position.top;
};

const clearPreviewAndEditor = () => {
  currentPreviewElement.value = null;
  currentEditorElement.value = null;
};

const dynamicTop = ref(0);

</script>
<style></style>