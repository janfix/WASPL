<template>
  <div class="pages-container">
    <div class="row">
      <div class="col">
        <button type="button" @click="addPage" class="btn TopPageBT TopAdd btn-sm">Add Page</button>
      </div>
      <div class="col" style="display: flex; justify-content: flex-end; align-items: center; margin-top:-20px">
        <div class="icon-container" style="margin-right: 10px;">
          <img title="Import Question from item collection" @click="$emit('toggle-item-bank')"
            src="@/assets/Import2ItemLib.png" alt="import items" />
        </div>
        <div hidden class="icon-container">
          <img title="Export All Questions to the item collection (except duplicates)"
            @click="console.log('DISPLAY ITEM BANK WITH SELECTOR SYSTEM')" src="@/assets/Export2ItemLib.png"
            alt="export items" />
        </div>
      </div>
    </div>

    <div v-for="page in pages" :key="page.id" class="mb-4" :class="{ 'active-page': isPageActive(page) }">
      <div class="d-flex flex-column gap-2 pageGroup">
        <div class="row">
          <div class="col">
            <h3>{{ page.label }}</h3>
          </div>
          <div class="col">
            <div class="Page-actions">
              <button class="action-btn" @click="addElement(page.id)" title="Add Elements">
                <font-awesome-icon :icon="['fas', 'plus-circle']" />
              </button>
              <button class="action-btn" @click.stop="deletePage(page.id)" title="Delete Page">
                <font-awesome-icon :icon="['fas', 'trash']" />
              </button>
            </div>
          </div>
        </div>

        <draggable v-model="page.children" group="elements" @end="store.updatePageOrder(page.id, page.children)"
          item-key="id" class="drag-container" @dragover.prevent @drop="onDrop(page)">
          <template #item="{ element: child }">
            <div class="card cursor-pointer" :class="{ 'active-card': child.id === activeElementId }"
              @click="handleElementClick(child.id, child.label)">
              <div class="card-body row">
                <div>
                  <div class="row">
                    <div class="col">
                      <div class="interaction-type">{{ getInteractionType(child.id) }}</div>
                    </div>
                    <div class="col" style="text-align: right; margin-top: -15px!important">
                      <i class="fa-solid fa-pen-to-square editPageLabel" @click="enableEdit(child)"></i>
                      <span title="Delete Element!" class="delElement" @click.stop="deleteElement(child.id)">
                        <i class="fa-solid fa-xmark"></i>
                      </span>
                    </div>
                  </div>
                  <h5 v-if="!child.isEditing" class="card-title" @dblclick="enableEdit(child)">
                    {{ child.label }}
                  </h5>
                  <input v-else type="text" 
                  class="card-title-input" 
                  v-model="child.label" 
                  @blur="disableEdit(child)"
                  @keyup.enter="disableEdit(child)" :ref="(el) => editInput[child.id] = el" />
                </div>




              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>


<script setup>
import { useTestStore } from '../stores/testStore'
import { computed, ref,nextTick } from 'vue'
import draggable from 'vuedraggable'
import { v4 as uuidv4 } from 'uuid'

const store = useTestStore()
const editInput = ref([]);

const emit = defineEmits(['clear-preview-and-editor', "element-clicked", 'toggle-item-bank'])

const pages = computed(() => store.testData?.pages || [])
const activeElementId = ref(null) // Variable réactive pour l'élément actif

// Vérifie si une page contient l'élément actif
const isPageActive = (page) => {
  return page.children.some((child) => child.id === activeElementId.value)
}

const handleElementClick = (elementId, label) => {
  if (elementId) {
    activeElementId.value = elementId
    const element = store.getElementById(elementId)

    if (element) {
      store.setSelectedElement(element, label)
      const rect = document.querySelector(`.card.cursor-pointer.active-card`)?.getBoundingClientRect();
      const position = rect
        ? { top: rect.top, height: rect.height }
        : { top: 0, height: 0 };

      console.log(position)

      // Émettre les données de position
      emit("element-clicked", position);
    }
  }
}

//Récupère le type d'interaction : 
const getInteractionType = (elementId) => {
  const element = store.testData.elements.find(el => el.el_ID === elementId);
  return element ? element.el_Type : 'Type non défini';
};

// Ajout d'une nouvelle page
const addPage = () => {
  const newPage = {
    id: uuidv4(),
    label: `Page ${pages.value.length + 1}`,
    children: [],
  }
  store.addPage(newPage)
}

// Supprimer une page
const deletePage = (pageId) => {
  // Confirmer la suppression avec l'utilisateur
  if (confirm("Êtes-vous sûr de vouloir supprimer cette page ?")) {
    // Appeler la méthode du store pour supprimer la page
    store.deletePage(pageId);

    // Si vous avez besoin de nettoyer les éléments associés à cette page, vous pouvez le faire ici
    // Par exemple, supprimer tous les éléments qui appartiennent à cette page
    store.testData.elements = store.testData.elements.filter(element => {
      return !store.testData.pages.some(page => page.children.some(child => child.id === element.el_ID));
    });

    // Sauvegarder les modifications dans le store
    store.saveTestDataToDatabase();
  }
};

const addElement = (pageID) => {
  const ElementID = uuidv4()
  store.addElement(pageID, ElementID)
}

const deleteElement = (childID) => {
  if (confirm("Confirm you really want to delete this element?")) {
    store.deleteElement(childID);
  }
};


// Activer l'édition et donner le focus à l'input
const enableEdit = (child) => {
  child.isEditing = true;
  nextTick(() => {
    if (editInput.value[child.id]) {
      editInput.value[child.id].focus();
    }
  });
};

// Désactiver l'édition
const disableEdit = (child) => {
  child.isEditing = false;
  store.updateElement(child); // Sauvegarde automatique après édition
};

const onDrop = (page) => {
  // Récupérer les données de l'élément transféré
  const itemData = JSON.parse(event.dataTransfer.getData("application/json"));

  // Générer un nouvel ID unique pour l'élément
  const newElementID = uuidv4();

  // Créer un nouvel élément basé sur l'élément importé
  const newElement = {
    ...itemData, // Copie les données de l'itemBank
    el_ID: newElementID, // Remplace l'ID pour éviter les conflits
    _id: undefined, // Supprime l'ancienne référence _id
    isNewElement: true, // Marquer comme nouvel élément pour différenciation si besoin
  };

  // Ajouter le nouvel élément au tableau global des éléments
  store.testData.elements.push(newElement);

  // Ajouter une référence dans la page concernée
  page.children.push({
    id: newElementID, // Lien avec l'ID global
    label: newElement.el_Label, // Utiliser le label existant
  });

  // Sauvegarder les modifications dans le store
  store.saveTestDataToDatabase();

  console.log(`Nouvel élément ajouté à la page ${page.label} :`, newElement);
};


</script>


<style scoped>
.card-title-input {
  width: 100%;
  font-size: 1em;
  font-weight: 430;
}

.pageGroup {
  padding: 10px;
  border: 1px solid grey;
  border-radius: 10px;
}

h3 {
  font-weight: 500;
  font-size: 1.3em;
}

h5 {
  font-weight: 430;
  font-size: 1em;
}

.cursor-pointer {
  cursor: pointer;
}

.pages-container {
  border: 1px gainsboro solid;
  border-radius: 5px;
  margin-left: -7px;
  padding: 10px;
}

.TopPageBT {
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 20px;
  color: white;
  border: 1px solid rgb(209, 209, 211);
  border-radius: 5px;
}

.TopAdd {
  background-color: #5ba4f7;
}

.TopNode {
  background-color: rgb(78, 212, 78);
}

.TopImport {
  background-color: rgb(83, 37, 86);
}

.action-btn {
  background: none;
  border: none;
  color: #495057;
  cursor: pointer;
  font-size: 16px;
  padding: 0;
  margin-right: 5px;
}

.Page-actions {
  text-align: right;
}

/* Classe pour une page contenant l'élément actif */
.active-page {
  background-color: #d1ecf1;
  border-radius: 12px;
  border: 1px solid #65858a;
  transition: background-color 0.3s, border-color 0.3s;
}

/* Classe pour l'élément actif */
.active-card {
  background-color: #8cb3dd;
  color: white;
  border: 2px solid #335172;
  transition: background-color 0.3s, border-color 0.3s;
}

.delElement {
  margin-right: -10px;
  margin-left: 5px;
  color: rgb(246, 102, 102);
  cursor: pointer;
}

.delElement:hover {
  font-size: 1.2em;
  color: red;
}


.ExportElement {
  margin-left: 5px;
}

.drag-container {
  min-height: 50px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 10px;
  background-color: #f9f9f9;
}

.drag-container .card {
  margin-bottom: 10px;
  cursor: grab;
}

.drag-container .card:active {
  cursor: grabbing;
}

.editPageLabel {
  cursor: pointer;
  color: #007bff;
}

.editPageLabel:hover {
  color: #1201fa;
  font-size: 1.2em;
}

.card-body .col-2 {
  opacity: 0;
  /* Masquer les icônes par défaut */
  transition: opacity 0.3s ease;
  /* Animation de l'apparition */
}

.card-body:hover .col-2 {
  opacity: 1;
  /* Afficher les icônes lorsqu'on survole la carte */
}



.icon-container {
  cursor: pointer;
  width: 40px;
  /* Largeur de l'icône */
  height: 40px;
  /* Hauteur de l'icône */
  border-radius: 50%;
  /* Arrondi complet */
  overflow: hidden;
  /* Cache le contenu débordant */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  /* Ombre avec arrondi */
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-container img {
  width: 100%;
  /* S'adapte à la taille du conteneur */
  height: 100%;

}

.icon-container:hover {
  box-shadow: 0 4px 8px rgba(100, 99, 99, 0.8);
}

.interaction-type {
  padding: 2px 5px 2px 5px;
  width: fit-content;
  background-color: #0DCAF0;
  text-align: center;
  border: 1px solid gainsboro;
  border-radius: 10px;
  margin-top: -10px;
  margin-left: -10px;
  margin-bottom: 10px;
  font-size: 0.8em;
  font-weight: bold;
  color: #f8fafc;
}
</style>
