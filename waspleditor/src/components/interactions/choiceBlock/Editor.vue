<template>
  <div class="editor-container">
    <div v-if="selectedElement" class="card">
      <cardHeader 
        :elementLabel="elementLabel" 
        :elementType="selectedElement.el_Type" 
        :mode="'Editor'"  
      />
      <div class="card-body">

        <form @submit.prevent="saveElement">
          <div hidden class="mb-3">
            <label class="form-label">Element Label</label>
            <input type="text" class="form-control" v-model="elementLabel" @input="handleLabelChange(elementLabel)">
          </div>
          <div hidden class="mb-3">
            <label class="form-label">Element ID</label>
            <input type="text" class="form-control" v-model="selectedElement.el_ID" readonly>
          </div>
          <div class="mb-3" v-show="selectedElement.isNewElement">
            <label class="form-label">Type</label>
            <input type="text" class="form-control" v-model="selectedElement.el_Type">
          </div>
          <div class="mb-3">
            <h3>
              <input placeholder="Main prompt" type="text" class="inputMainPrompt" v-model="selectedElement.el_Text" />
            </h3>
          </div>
          <div class="form-group mb-3">
            <div ref="quillEditor" class="quill-editor"></div>
          </div>



        </form>
      </div>
      <div class="card-footer ">
        <div class="row">
          <div class="col-10">
            <button type="button" class="btn btn-primary">Save Changes</button>
            <button type="button" class="btn btn-info sendToItemLibBT">Send to item Collection</button>
            <button type="button" class="btn btn-warning ml-2">Create with AI</button>
            
          </div>
          <div class="col-2">
            <button class="btn btn-danger btn">Delete</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="alert alert-info">
      Select an element to edit
    </div>
  </div>
</template>

<script setup>
import cardHeader from '../default/cardHeader.vue';
import { useTestStore } from '../../../stores/testStore'
import { computed, ref, watch, onMounted } from 'vue'
import Quill from 'quill'

const store = useTestStore()

const selectedElement = computed(() => store.selectedElement)
const elementLabel = ref('')
const quillEditor = ref(null) // Référence pour l'éditeur Quill
let quillInstance = null // Instance de Quill

watch(() => store.selectedElementLabel, (newLabel) => {
  elementLabel.value = newLabel || ''
}, { immediate: true })

const handleLabelChange = (newLabel) => {
  store.updateElementLabel(newLabel)
}

if (quillInstance && selectedElement.el_RichText) {
  quillInstance.root.innerHTML = selectedElement.el_RichText;
}

const saveElement = () => {
  if (selectedElement.value) {
    store.updateElement(selectedElement.value)
  }
}

// Initialisation de l'éditeur Quill
onMounted(() => {
  if (quillEditor.value) {
    quillInstance = new Quill(quillEditor.value, {
      theme: 'snow',
      modules: {
        toolbar: [
          // Styles de texte
          ['bold', 'italic', 'underline', 'strike'], // Gras, italique, souligné, barré

          // Titres
          [{ header: 1 }, { header: 2 }], // Titres niveau 1 et 2
          [{ header: [1, 2, 3, 4, 5, 6, false] }], // Menu déroulant des tailles de titre

          // Listes et indentations
          [{ list: 'ordered' }, { list: 'bullet' }], // Listes ordonnées et à puces
          [{ indent: '-1' }, { indent: '+1' }], // Indentation

          // Alignement
          [{ align: [] }], // Alignement : gauche, centre, droite, justifié

          // Couleurs
          [{ color: [] }, { background: [] }], // Couleur de texte et d'arrière-plan

          // Médias
          ['image', 'link'], // Insérer une image, un lien, ou une vidéo

          // Nettoyer la mise en forme
          ['clean'], // Bouton pour effacer le formatage
        ],
      },
    })

    // Synchroniser Quill avec les données
    if (selectedElement.value?.el_RichText) {

      quillInstance.root.innerHTML = selectedElement.value.el_RichText
    }

    quillInstance.on('text-change', () => {
      if (selectedElement.value) {
        selectedElement.value.el_RichText = quillInstance.root.innerHTML
        store.updateElement({ ...selectedElement.value });
      }
    })
  }
})
</script>

<style scoped>
.card-header {
  background-color: #426C9C;
  color: white
}

.sendToItemLibBT {
  margin-left: 10px;
}

.languageSelectorContainer{
  width : 220px;
  font-size: 0.8em;
}

.input-group>:not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(.valid-feedback):not(.invalid-tooltip):not(.invalid-feedback) {
 border-top-right-radius: 5px;
}
</style>